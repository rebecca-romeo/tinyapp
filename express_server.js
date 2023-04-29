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

// ---- GET ROUTES -----
// Homepage
app.get("/", (req, res) => {
  const user = users[req.session['user_id']];
  if (user) {
    return res.redirect('/urls');
  }

  res.redirect('/login');
});

// GET register
// Register form
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: users[req.session['userId']] };

  // if user is logged in and tries going to the register page, redirect them to urls
  if (user) {
    res.redirect('/urls');
  }

  res.render('register', templateVars);
});

// GET login
// Login form
// Also creates cookie and redirects user to /urls
app.get("/login", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = { user };

  // if user is logged in and tries going to the register page, redirect them to urls
  if (user) {
    res.redirect('/urls');
  }

  res.render('login', templateVars);
});

// Route: submit long url
// A form (from urls_new ejs). User types a website and hits submit
app.get("/urls/new", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = { user };

  // If user is not logged in, they can't view this page. Redirect to login
  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

// GET /u/:id
// use tiny url id, redirect user to longURL site
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  // If url not found, show err msg
  if (!urlDatabase[id]) {
    res.status(404).send("That shortened URL does not exist. Please try again.");
  } else {
    res.redirect(urlDatabase[id].longURL);
  }
});

// GET /urls/:id
// page after the user creates a tiny url
// user can view short&long url, and edit long url
app.get("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid tinyURL, please try again. ");
  }

  if (!user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to view this URL.");
  }

  const templateVars = {
    user,
    id,
    longURL: urlDatabase[id].longURL
  };

  res.render("urls_show", templateVars);
});

// GET /urls
// Displays all shortURLS, longURLS, edit, and delete buttons.
app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  // console.log("check user", user);

  // If user is not logged in, redirect to login
  if (!user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  const userUrls = urlsForUser(user.id);
  // console.log('check all urls', userUrls);

  const templateVars = {
    urls: userUrls,
    user
  };

  res.render("urls_index", templateVars);
});

// ---- POST ROUTES -----
// POST register
app.post("/register", (req, res) => {
    // create a random id
  const userId = generateRandomString();

  const email = req.body.email;
  const pw = req.body.password;
  const password = bcrypt.hashSync(pw, 10);

  // Empty email or pw submission on register form
  if (email === "" || pw === "") {
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

  req.session.user_id = userId;
  res.redirect('/urls');
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

// POST /logout
app.post("/logout", (req, res) => {
  // clear the user cookie
  req.session = null;
  res.redirect('/login');
});

// POST /urls
// user submits a longURL, short url is generated
// user redirected to urls/tinyurl to see the short&long URLS
// (longURL / submit button from urls_new ejs)
app.post("/urls", (req, res) => {
  const user = users[req.session['user_id']];

  if (!user) {
    return res.status(403).send("You must be logged in to view this page");
  }

  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = {
    userID: user.id,
    longURL: req.body.longURL
  };

  // Redirect the user to the urls/:id page
  res.redirect(`/urls/${shortUrl}`);
});

// POST /urls/:id/delete
// delete row (button in urls_index)
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session['user_id']];
  const id = req.params.id;

  if (!user) {
    return res.status(403).send(`You must be logged in to delete this url. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to delete a URL that is not yours.");
  }

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Invalid tinyURL, please try again.");
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// POST /urls/:id
//takes the longurl the user submit and replaces the original url (form in urls_show ejs)
app.post("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid tinyURL, please try again.");
  }

  if (!user) {
    return res.status(403).send(`You must be logged in to delete this url. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to edit a URL that is not yours.");
  }

  urlDatabase[id].longURL = req.body.editURL;

  res.redirect(`/urls/${id}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});