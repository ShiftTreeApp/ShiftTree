import itertools
import json
from collections.abc import Iterable, Mapping
from datetime import datetime
from typing import Any, Protocol, Self

from ortools.sat.python import cp_model
from pydantic import BaseModel, Field

from scheduling import models

type ShiftId = str

type EmployeeId = str


class Shift(BaseModel):
    start_time: datetime
    end_time: datetime


class Request(BaseModel):
    weight: float = Field(default=1)


class Employee(BaseModel):
    min_shifts: int | None = Field(default=None)
    requests: Mapping[ShiftId, Request] = Field(default=None)


class Config(BaseModel):
    shifts: Mapping[ShiftId, Shift]
    employees: Mapping[EmployeeId, Employee]
    seed: int | None = Field(default=None)
    """Random seed for the solver. If not provided, the solver does not produce deterministic results."""

    @classmethod
    def from_request(cls, request: models.ScheduleRequest) -> Self:
        return cls(
            shifts={
                s.id: Shift(start_time=s.start_time, end_time=s.end_time)
                for s in request.shifts
            },
            employees={
                signup.user_id: Employee(
                    requests={shift.id: Request(weight=signup.weight)}
                )
                for shift in request.shifts
                for signup in shift.signups
            },
            seed=request.seed,
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
    """Attempts to evenly distribute shifts across employees, disregarding specified min shifts.

    If the number of employees divides the total number of shifts, then the min and max number of shifts are the same.
    Otherwise some employees have to work one more shift than others.
    """
    min_shifts_per_employee = len(config.shifts) // len(config.employees)
    if len(config.shifts) % len(config.employees) == 0:
        max_shifts_per_employee = min_shifts_per_employee
    else:
        max_shifts_per_employee = min_shifts_per_employee + 1

    for e in config.employees:
        num_shifts_worked = sum(assignments[(e, s)] for s in config.shifts)
        model.add(min_shifts_per_employee <= num_shifts_worked)
        model.add(num_shifts_worked <= max_shifts_per_employee)


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
            if (
                abs((shift2.start_time - shift1.end_time).total_seconds()) < 8 * 3600
                or abs((shift1.start_time - shift2.end_time).total_seconds()) < 8 * 3600
            ):
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


def solve(config: Config, rules: Iterable[Rule]) -> models.ScheduleResponse:
    if not config.employees or not config.shifts:
        return models.ScheduleResponse(
            assignments=[],
            events=[],
            status="optimal",
        )

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

    print(model.validate())

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
