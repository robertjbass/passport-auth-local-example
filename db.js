const fs = require("fs");

const initializeDB = () => {
  try {
    const db = fs.readFileSync("db.json");
    JSON.parse(db);
  } catch {
    fs.writeFileSync("db.json", JSON.stringify([]));
  }
};

const getUsers = () => {
  const data = fs.readFileSync("db.json");
  const userData = JSON.parse(data);
  return userData;
};

const getUserByEmail = (email) => {
  const data = fs.readFileSync("db.json");
  const userData = JSON.parse(data);
  return userData.find((user) => user.email === email);
};

const getUserById = (id) => {
  const data = fs.readFileSync("db.json");
  const userData = JSON.parse(data);
  return userData.find((user) => user.id === id);
};

const addUser = ({ name, email, password }) => {
  const users = getUsers();
  users.push({ id: users.length + 1, name, email, password });
  fs.writeFileSync("db.json", JSON.stringify(users));
};

module.exports = {
  initializeDB,
  getUsers,
  getUserByEmail,
  getUserById,
  addUser,
};
