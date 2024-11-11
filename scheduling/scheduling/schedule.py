import itertools
from collections.abc import Iterable, Mapping
from datetime import datetime
from typing import Protocol, Self

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
        )


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
                model.add(assignments[(e, s1)] + assignments[(e, s2)] <= 1)


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
                model.add(assignments[(e, s1)] + assignments[(e, s2)] <= 1)


def solve(config: Config, rules: Iterable[Rule]):
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

    solver = cp_model.CpSolver()
    status = solver.solve(model)

    if status == cp_model.OPTIMAL:
        print("Solution:")
        for e in config.employees:
            for s in config.shifts:
                if solver.value(shift_asgn[(e, s)]) == 1:
                    weight = requested_weight(employee=e, shift=s)
                    shift = config.shifts[s]
                    start_time_str = shift.start_time.strftime("%m-%d-%y %H:%M")
                    end_time_str = shift.end_time.strftime("%m-%d-%y %H:%M")
                    if weight > 0:
                        print(
                            f"'{e}' works shift '{s}' (requested weight={weight}) from {start_time_str} to {end_time_str}"
                        )
                    else:
                        print(
                            f"'{e}' works shift '{s}' (not requested) from {start_time_str} to {end_time_str}"
                        )
            print()
    else:
        print(f"No optimal solution found! ({status=})")

    print("Statistics:")
    print(f" - conflicts: {solver.num_conflicts}")
    print(f" - branches : {solver.num_branches}")
    print(f" - wall time: {solver.wall_time}s")


def main() -> None:
    config = Config(
        shifts={
            f"{d}-{s}": Shift(start_time=datetime.now(), end_time=datetime.now())
            for d, s in itertools.product({1, 2, 3, 4, 5, 6, 7}, {1, 2, 3})
        },
        employees={
            k: Employee(requests={s: Request() for s in v})
            for k, v in {
                "A": {"1-1", "3-2", "4-2", "5-1", "7-3"},
                "B": {"1-3", "2-1", "3-2", "5-3", "6-2"},
                "C": {"2-1", "3-1", "4-1", "6-3", "7-1"},
                "D": {"2-1", "2-2", "4-3", "6-1", "7-2"},
                "E": {"1-1", "2-3", "5-2", "6-2", "7-1"},
            }.items()
        },
    )

    solve(
        config,
        rules=(
            exactly_one_shift_per_employee,
            evenly_distribute_shifts,
            prevent_overlapping_shifts,
            prevent_consecutive_shifts,
        ),
    )


if __name__ == "__main__":
    main()
