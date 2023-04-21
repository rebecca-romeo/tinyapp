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
  res.send(`Welcome to TinyApp!

  To create an account,
  <a href="/register">Register here</a>.

  If you have an account, <a href="/login">Login here</a>.`);
});

// GET /urls
app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = { urls: urlDatabase, user };

  // If user is not logged in, redirect to login
  if (!user) {
    res.redirect("/login");
  }

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

  if (!user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid tinyURL, please try again. ");
  }

  // if (urlDatabase[id].userID !== user) {
  //   return res.status(403).send("You do not have permission to view this URL.");
  // }

  const templateVars = {
    user,
    id,
    longURL: urlDatabase[req.params.id].longURL
  };

  res.render("urls_show", templateVars);
});

// GET /u/:id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
    // If url not found, show err msg
  if (!urlDatabase[id]) {
      res.status(404).send("That shortened URL does not exist. Please try again.");
  }

  const longURL = urlDatabase[id].longURL;


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
  const userId = req.session['user_id'];
  const user = users[userId]

  if (!user) {
    return res.status(403).send("You must be logged in to view this page");
  }

  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userId
  }

  res.redirect(`/urls/${shortUrl}`);
});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session['user_id']];
  const id = req.params.id;

  if (!user) {
    return res.status(403).send(`You must be logged in to delete this url. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  // if (urlDatabase[id].userID !== user.id) {
  //   return res.status(403).send("You do not have permission to delete a URL that is not yours.");
  // }

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Invalid tinyURL, please try again.");
  }


  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id]["longURL"] = req.body.editURL;
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