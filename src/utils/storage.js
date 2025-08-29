import { defaultEmployees } from "../data/employees";

const defaultUsers = {
  boss: "boss123",
  admin: "admin123",
  supervisor: "super123",
};
const EMPLOYEE_KEY = "employees";
// Load users from localStorage or default
export function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : defaultUsers;
}

// Validate login
export function validateUser(role, password) {
  const users = getUsers();
  return users[role] === password;
}

// Change password
export function changePassword(role, newPass) {
  const users = getUsers();
  users[role] = newPass;
  localStorage.setItem("users", JSON.stringify(users));
}
// Add new employee
export function addEmployee(name) {
  const employee = getEmployees();
  if (!employee.includes(name)) {
    employee.push(name);
    saveEmployees(employee);
  }
}





// ✅ Load employees (from localStorage or fallback to default)
export function getEmployees() {
  const stored = localStorage.getItem(EMPLOYEE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultEmployees;
    }
  }
  return defaultEmployees;
}

// ✅ Save employees back to storage
export function saveEmployees(list) {
  localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(list));
}
