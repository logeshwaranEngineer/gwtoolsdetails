// utils/storage.js

// Default credentials (only first time)
const defaultUsers = {
  boss: "boss123",
  admin: "admin123",
  supervisor: "super123"
};

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
