const express = require("express");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const { users, urlDatabase } = require('./database');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['vj43qev', 'rf4343jf3', 'h43fj3kf', '4235qkrf'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));


// ---- DATABASES -----
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "$2a$10$u7cqKkuIqOjenKJCX5XSHOLMyQRArqCXk.Zkt1Bti4ht13e2p97wG"
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "$2a$10$oNYgh7N8X92224imwO5iAOaz776q3FtjPgaq.9s6/xp23voNxPwNC"
//   },
// };


// ---- GET ROUTES -----
// Homepage
app.get("/", (req, res) => {
  res.send(`Welcome to TinyApp!

  To create an account,
  <a href="/register">Register here</a>.

  If you have an account, <a href="/login">Login here</a>.`);
});

// GET /urls
app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  console.log("check user", user)



  // If user is not logged in, redirect to login
  if (!user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }


  const userUrls = urlsForUser(user.id);
  console.log('check all urls', userUrls)

  const templateVars = {
    urls: userUrls,
    user
  };


  res.render("urls_index", templateVars);
});

// GET /urls/new"
app.get("/urls/new", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = { user };

  // If user is not logged in, redirect to login
  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

// GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  const id = req.params.id;
  const templateVars = {
    user,
    id,
    longURL: urlDatabase[id].longURL
  };

  res.render("urls_show", templateVars);
});

// GET /u/:id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  // If url not found, show err msg
  if (!longURL) {
    res.status(404).send("That shortened URL does not exist. Please try again.");
  }

  res.redirect(longURL);
});

// GET register
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: users[req.session['userId']] };

  // If user's signed in, display /urls
  if (user) {
    res.redirect('/urls');
  }

  res.render('register', templateVars);
});


// GET login
app.get("/login", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = { user };

  // If user's signed in, display /urls
  if (user) {
    res.redirect('/urls');
  }

  res.render('login', templateVars);
});


// ---- POST ROUTES -----
// POST /urls
app.post("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  console.log('line 149 user', user)
  if (!user) {
    return res.status(403).send("You must be logged in to view this page");
  }

  const shortUrl = generateRandomString();
  console.log(shortUrl);
  urlDatabase[shortUrl] = {
    userID: user.id,
    longURL: req.body.longURL
  }
  // urlDatabase[shortUrl] = req.body.longURL;
  console.log("updated db", urlDatabase);
  console.log("req body", req.body);

  res.redirect(`/urls/${shortUrl}`);
});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.editURL;
  res.redirect(`/urls/${id}`);
});

// POST login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  // Email doesn't exist
  if (!user) {
    return res.status(403).send("This email was not found. Please try signing in again or register instead.");
  }

  // Incorrect password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password. Please try again");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

// POST register
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const pw = req.body.password;
  const password = bcrypt.hashSync(pw, 10);

  // Empty email or pw submission on register form
  if (email === "" || pw === "") {
    // console.log("all users", users);
    return res.status(400).send("Please enter your email and a password");
  }

  // Email already signed up
  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already registered");
  }

  // Add user object/info to database
  users[userId] = {
    id: userId,
    email,
    password
  };

  console.log("all users", users);
  req.session.user_id = userId;
  res.redirect('/urls');

});

// POST /logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});