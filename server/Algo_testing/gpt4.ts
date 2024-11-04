// Test data
const employees = ["Alice", "Bob", "Charlie", "David", "Eve"];
const shifts = [
  {
    id: 1,
    datetime: "2023-10-01T08:00:00",
    signups: [
      { name: "Alice", weight: 2 },
      { name: "Bob", weight: 1 },
    ],
  },
  {
    id: 2,
    datetime: "2023-10-01T16:00:00",
    signups: [{ name: "Charlie", weight: 3 }],
  },
  { id: 3, datetime: "2023-10-02T08:00:00", signups: [] },
  {
    id: 4,
    datetime: "2023-10-02T16:00:00",
    signups: [
      { name: "David", weight: 2 },
      { name: "Eve", weight: 2 },
    ],
  },
  {
    id: 5,
    datetime: "2023-10-03T08:00:00",
    signups: [{ name: "Alice", weight: 1 }],
  },
  { id: 6, datetime: "2023-10-03T16:00:00", signups: [] },
];

const shiftsNeeded = Math.ceil(shifts.length / employees.length);
const employeeShiftsNeed = employees.reduce((acc, employee) => {
  acc[employee] = shiftsNeeded;
  return acc;
}, {});

const unwantedShifts = [];
const assignedShifts = [];
const employeeLastShift = {};

// Helper function to assign a shift to an employee
function assignShift(shift, employee) {
  assignedShifts.push({ shiftId: shift.id, employee });
  employeeShiftsNeed[employee]--;
  employeeLastShift[employee] = shift.datetime;
}

// Helper function to check if an employee can work a shift
function canWorkShift(employee, shift) {
  if (!employeeLastShift[employee]) return true;
  const lastShiftTime = new Date(employeeLastShift[employee]).getTime();
  const currentShiftTime = new Date(shift.datetime).getTime();
  return currentShiftTime - lastShiftTime >= 8 * 60 * 60 * 1000; // Ensure at least 8 hours between shifts
}

// Iterate through shifts and assign based on signups
shifts.forEach(shift => {
  if (shift.signups.length === 0) {
    unwantedShifts.push(shift);
  } else {
    // Sort signups by weight (descending) and then by shifts needed (descending)
    const sortedSignups = shift.signups.sort((a, b) => {
      if (a.weight !== b.weight) {
        return b.weight - a.weight;
      }
      return employeeShiftsNeed[b.name] - employeeShiftsNeed[a.name];
    });

    // Find the first employee who can work the shift
    const employee = sortedSignups.find(
      signup =>
        employeeShiftsNeed[signup.name] > 0 && canWorkShift(signup.name, shift),
    )?.name;

    if (employee) {
      assignShift(shift, employee);
    } else {
      unwantedShifts.push(shift);
    }
  }
});

// Assign unwanted shifts to remaining employees
unwantedShifts.forEach(shift => {
  const availableEmployees = employees.filter(
    employee =>
      employeeShiftsNeed[employee] > 0 && canWorkShift(employee, shift),
  );
  if (availableEmployees.length > 0) {
    const randomEmployee =
      availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
    assignShift(shift, randomEmployee);
  }
});

// Output the assigned shifts
console.log("Assigned Shifts:", assignedShifts);
console.log("Unwanted Shifts:", unwantedShifts);
console.log("Employee Shifts Need:", employeeShiftsNeed);
