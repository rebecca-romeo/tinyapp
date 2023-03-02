const { users, urlDatabase } = require('./database');

const getUserByEmail = function(email, users) {
  const userValues = Object.values(users);
  for (const user of userValues) {
    if (user.email === email) {
      return user;
    }
  }
};

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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


module.exports =  {
  getUserByEmail,
  generateRandomString,
  urlsForUser
}