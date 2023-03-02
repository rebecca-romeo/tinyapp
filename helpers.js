const getUserByEmail = function(email, users) {
  const userValues = Object.values(users);
  for (const user of userValues) {
    if (user.email === email) {
      return user;
    }
  }
};


module.exports =  getUserByEmail;