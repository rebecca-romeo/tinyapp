const express = require("express");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const { users, urlDatabase } = require('./database');
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['vj43qev', 'rf4343jf3', 'h43fj3kf', '4235qkrf'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const PORT = 3001; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


// *************************
////////// ROUTES
// *************************

// Route: Homepage
app.get("/", (req, res) => {
  res.redirect('/login')
});

// Route: get register
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };

  const userId = req.session.user_id;
  const user = users[userId];

  // if user is logged in and tries going to the register page, redirect them to urls
  if (user) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});

// Route:  get login
// creates cookie and redirects user to /urls
app.get("/login", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  // if user is logged in and tries going to the login page, redirect them to urls
  if (user) {
    return res.redirect('/urls');
  }

  res.render('login', {user: null});
});

// Route: submit url
// a form (from urls_new ejs). user types a website and hits submit
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };

  if (!templateVars.user) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

// Route: short url id
// use tiny url id, redirect user to longURL site
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if (!longURL) {
    res.status(404).send("That shortened URL does not exist. Please try again.");
  } else {
    res.redirect(longURL);
  }
});

// Route: urls/id
// page after the user creates a tiny url
// user can view short&long url, and edit long url
app.get("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  const id = req.params.id;
  if (!user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid tinyURL, please try again. ");
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to view this URL.");
  }

  const templateVars = {
    user: user,
    id: id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

// Route: urls
app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`);
  }

  const urls = urlsForUser(user.id);
  console.log(urls);

  const templateVars = {
    urls,
    user
  };

  res.render("urls_index", templateVars);
});

// Route: post register
app.post("/register", (req, res) => {
  // create a random id
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).send("Please enter your email and a password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already registered");
  }

  // add the new user & info to the global users object
  users[userId] = {
    id: userId,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };

  console.log(users);

  // res.cookie('user_id', userId);
  req.session.user_id = userId;
  res.redirect('/urls');
});

// Route: post login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("This email was not found. Please try signing in again or register instead.");
  }
  // if(password !== user.password)
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password. Please try again");
  }

  // res.cookie('user_id', user.id);
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Route: post logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Route: post submitted url
// user submits a longURL, short url is generated
// user redirected to urls/tinyurl to see the short&long URLS
// (longURL / submit button from urls_new ejs)
app.post("/urls", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    return res.status(403).send("You must be logged in to view this page");
  }

  // On post, generate a random string
  const randomString = generateRandomString();

  // Add the random string to the database as a key, and the value is the longurl that the user submitted
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: userId
  };

  // Redirect the user to the urls/:id page
  res.redirect(`/urls/${randomString}`);
});

// Route: edit longurl
//takes the longurl the user submit and replaces the original url (form in urls_show ejs)
app.post("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  const shortID = req.params.id;
  const longURL = req.body.editURL;


  if (urlDatabase[shortID].userID === user.id) {
    urlDatabase[shortID].longURL = longURL;
    res.redirect('/urls');
  } else {
    // Return an error message if the user does not own the URL
    res.status(403).send("You do not have permission to edit this URL.");
  }

  res.redirect('/urls');
});

// Route: delete row (button in urls_index)
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});