import itertools
import json
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import datetime, timedelta
from math import sqrt
from random import Random
from typing import Any, Protocol, Self

from ortools.sat.python import cp_model
from pydantic import BaseModel, Field

from scheduling import models, offsets

type ShiftId = str

type EmployeeId = str


class Shift(BaseModel):
    start_time: datetime
    end_time: datetime


class Request(BaseModel):
    weight: float = Field(default=1)


class Employee(BaseModel):
    min_shifts: int | None = Field(default=None)
    requests: Mapping[ShiftId, Request] = Field(default_factory=dict)


class Config(BaseModel):
    shifts: Mapping[ShiftId, Shift]
    employees: Mapping[EmployeeId, Employee]
    seed: int | None = Field(default=None)
    """Random seed for the solver. If not provided, the solver does not produce deterministic results."""
    shift_gap: timedelta = Field(default_factory=lambda: timedelta(hours=8))

    @classmethod
    def from_request(cls, request: models.ScheduleRequest) -> Self:
        employees_from_shifts = {
            signup.user_id: Employee(
                requests={shift.id: Request(weight=signup.weight)},
                min_shifts=request.shift_offsets.get(signup.user_id),
            )
            for shift in request.shifts
            for signup in shift.signups
        }
        extra_employees = {
            user_id: Employee()
            for user_id in request.all_user_ids - set(employees_from_shifts.keys())
        }
        return cls(
            shifts={
                s.id: Shift(start_time=s.start_time, end_time=s.end_time)
                for s in request.shifts
            },
            employees=employees_from_shifts | extra_employees,
            seed=request.seed,
            shift_gap=timedelta(hours=24),
        )


def constraint_name(rule: str, **kwargs: Any) -> str:
    return json.dumps({"name": rule, "subjects": kwargs})


class Rule(Protocol):
    def __call__(
        self,
        *,
        model: cp_model.CpModel,
        assignments: Mapping[tuple[EmployeeId, ShiftId], cp_model.IntVar],
        config: Config,
    ) -> None: ...


def exactly_one_shift_per_employee(
    model: cp_model.CpModel,
    assignments: Mapping[tuple[EmployeeId, ShiftId], cp_model.IntVar],
    config: Config,
):
    """Each shift is assigned to exactly one employee."""
    for shift in config.shifts:
        model.add_exactly_one(
            assignments[(employee, shift)] for employee in config.employees
        )


def evenly_distribute_shifts(
    model: cp_model.CpModel,
    assignments: Mapping[tuple[EmployeeId, ShiftId], cp_model.IntVar],
    config: Config,
):
    """Attempts to evenly distribute shifts across employees, taking into account the "min_shifts", which is
    repurposed to be the offset of the number of shifts each employee should work from the average.
    """
    shift_offsets = {e: config.employees[e].min_shifts or 0 for e in config.employees}
    target_shifts = offsets.compute_shifts_per_user(
        offsets=shift_offsets,
        n_shifts=len(config.shifts),
    )

    for e in config.employees:
        num_shifts_worked = sum(assignments[(e, s)] for s in config.shifts)
        model.add(num_shifts_worked == target_shifts[e])


def prevent_overlapping_shifts(
    model: cp_model.CpModel,
    assignments: Mapping[tuple[EmployeeId, ShiftId], cp_model.IntVar],
    config: Config,
):
    """Prevent employees from working overlapping shifts."""
    for e in config.employees:
        for s1, s2 in itertools.combinations(config.shifts, 2):
            shift1 = config.shifts[s1]
            shift2 = config.shifts[s2]
            if (
                shift1.start_time < shift2.end_time
                and shift2.start_time < shift1.end_time
            ):
                enforcement_var = model.new_bool_var(
                    constraint_name(
                        "prevent_overlapping_shifts",
                        user=f"user:{e}",
                        shift1=f"shift:{s1}",
                        shift2=f"shift:{s2}",
                    )
                )
                model.add(
                    assignments[(e, s1)] + assignments[(e, s2)] <= 1
                ).only_enforce_if(enforcement_var)
                model.add_assumption(enforcement_var)


@dataclass
class DateRange:
    start: datetime
    end: datetime

    def __contains__(self, other: datetime) -> bool:
        return self.start <= other <= self.end


def prevent_consecutive_shifts(
    model: cp_model.CpModel,
    assignments: Mapping[tuple[EmployeeId, ShiftId], cp_model.IntVar],
    config: Config,
):
    """Prevent employees from working consecutive shifts."""
    for e in config.employees:
        for s1, s2 in itertools.combinations(config.shifts, 2):
            shift1 = config.shifts[s1]
            shift2 = config.shifts[s2]
            shift1_blockout = DateRange(
                shift1.start_time - config.shift_gap, shift1.end_time + config.shift_gap
            )
            shift2_blockout = DateRange(
                shift2.start_time - config.shift_gap, shift2.end_time + config.shift_gap
            )
            print(config.shift_gap.total_seconds() / 60 / 60)
            print(shift1_blockout, shift2_blockout)
            if any(
                (
                    shift1.start_time in shift2_blockout,
                    shift1.end_time in shift2_blockout,
                    shift2.start_time in shift1_blockout,
                    shift2.end_time in shift1_blockout,
                )
            ):
                print(s1, s2)
                enforcement_var = model.new_bool_var(
                    constraint_name(
                        "prevent_consecutive_shifts",
                        user=f"user:{e}",
                        shift1=f"shift:{s1}",
                        shift2=f"shift:{s2}",
                    )
                )
                model.add(
                    assignments[(e, s1)] + assignments[(e, s2)] <= 1
                ).only_enforce_if(enforcement_var)
                model.add_assumption(enforcement_var)


default_rules = (
    exactly_one_shift_per_employee,
    evenly_distribute_shifts,
    prevent_overlapping_shifts,
    prevent_consecutive_shifts,
)


def _shuffle_config(config: Config, seed: int) -> Config:
    rand = Random(seed)

    employee_keys = list(config.employees.keys())
    rand.shuffle(employee_keys)

    shift_keys = list(config.shifts.keys())
    rand.shuffle(shift_keys)

    employees = {k: config.employees[k] for k in employee_keys}
    shifts = {k: config.shifts[k] for k in shift_keys}

    return config.model_copy(
        update=dict(shifts=shifts, employees=employees, seed=seed),
        deep=True,
    )


def _normalize_weights(config: Config) -> Config:
    config = config.model_copy(deep=True)
    for e in config.employees.values():
        if not e.requests:
            continue

        total_weight = sum(s.weight for s in e.requests.values())
        avg_weight = total_weight / len(e.requests)
        std_dev = sqrt(
            sum((req.weight - avg_weight) ** 2 for req in e.requests.values())
            / len(e.requests)
        )

        if std_dev < 1e-6:
            for req in e.requests.values():
                req.weight = 1
        else:
            for req in e.requests.values():
                normalized = (req.weight - avg_weight) / std_dev
                normalized_scaled = max((1 + normalized) / 2, 0)
                req.weight = 1 + normalized_scaled
    return config


def solve(config: Config, rules: Iterable[Rule]) -> models.ScheduleResponse:
    if not config.employees or not config.shifts:
        return models.ScheduleResponse(
            assignments=[],
            events=[],
            status="optimal",
        )

    if config.seed is not None:
        config = _shuffle_config(config, seed=config.seed)

    config = _normalize_weights(config)

    model = cp_model.CpModel()
    # Creates shift variables.
    # shift_asgn[(e, s)]: employee 'e' works shift 's'.
    shift_asgn: dict[tuple[str, str], cp_model.IntVar] = {}
    for e, s in itertools.product(config.employees, config.shifts):
        shift_asgn[(e, s)] = model.new_bool_var(f"{e}:{s}")

    for apply_rule in rules:
        apply_rule(model=model, assignments=shift_asgn, config=config)

    def requested_weight(employee: EmployeeId, shift: ShiftId) -> float:
        return config.employees[employee].requests.get(shift, Request(weight=0)).weight

    # The thing being maximized is the dot product of all possible shift assignments
    # and all shift requests (non requested shifts are weighted 0)
    model.maximize(
        sum(
            requested_weight(employee=e, shift=s) * shift_asgn[(e, s)]
            for e, s in itertools.product(config.employees, config.shifts)
        )
    )

    def requested_weight_or_none(employee: EmployeeId, shift: ShiftId) -> float | None:
        req = config.employees[employee].requests.get(shift, None)
        return req.weight if req is not None else None

    solver = cp_model.CpSolver()
    if config.seed is not None:
        solver.parameters.random_seed = config.seed
    status = solver.solve(model)

    assert status != cp_model.MODEL_INVALID, "Invalid model"

    assignments = (
        [
            (e, s)
            for e, s in itertools.product(config.employees, config.shifts)
            if solver.value(shift_asgn[(e, s)]) == 1
        ]
        if status == cp_model.OPTIMAL
        else []
    )

    bad_assignment_events = (
        models.Event(
            name="assignment to unrequested shift",
            subjects={
                "user": f"user:{e}",
                "shift": f"shift:{s}",
            },
        )
        for e, s in assignments
        if requested_weight_or_none(employee=e, shift=s) is None
    )

    constraint_events = (
        models.Event(name=f"constraint violated: {e.name}", subjects=e.subjects)
        for e in (
            models.Event(**json.loads(model.var_index_to_var_proto(var_index).name))
            for var_index in solver.sufficient_assumptions_for_infeasibility()
        )
    )

    statistic_events = (
        models.Event(
            name="statistics",
            subjects={
                "num_conflicts": solver.num_conflicts,
                "num_branches": solver.num_branches,
                "wall_time_s": solver.wall_time,
            },
        ),
    )

    return models.ScheduleResponse(
        assignments=[
            models.Assignment(
                shift_id=s,
                user_id=e,
                requested_weight=requested_weight_or_none(employee=e, shift=s),
            )
            for (e, s) in assignments
        ],
        events=[*constraint_events, *bad_assignment_events, *statistic_events],
        status="optimal" if status == cp_model.OPTIMAL else "infeasible",
    )
