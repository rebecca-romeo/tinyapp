const { users, urlDatabase } = require('./database');

// ---- FUNCTIONS -----

const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

//
const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
};

const urlsForUser = function(userId) {
  const urls = {};
  const ids = Object.keys(urlDatabase);

  for (const id of ids) {
    const url = urlDatabase[id];
    if (url.userID === userId) {
      urls[id] = url;
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};