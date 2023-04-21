const express = require("express");
const { getUserByEmail, generateRandomString } = require('./helpers');
const cookieSession = require('cookie-session')
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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ---- GET ROUTES -----
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];

  if (!user) {
    res.redirect("/login")
  }

  const templateVars = { urls: urlDatabase, user };
  console.log("temp vars:", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session['user_id']];

  if (!user) {
    res.redirect("/login")
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    res.status(404).send("That shortened URL does not exist. Please try again.");
  }

  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session['userId']] };
  const userId = req.session.user_id;
  const user = users[userId];

  if (user) {
    res.redirect('/urls')
  }

  res.render('register', templateVars);
});



app.get("/login", (req, res) => {
  const user = users[req.session['user_id']];

  if (user) {
    res.redirect('/urls')
  }

  const templateVars = { user };
  res.render('login', templateVars);
});


// ---- POST ROUTES -----
app.post("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.status(403).send("You must be logged in to view this page");
  }

  const shortUrl = generateRandomString();
  console.log(shortUrl);
  urlDatabase[shortUrl] = req.body.longURL;
  console.log("updated db", urlDatabase);
  console.log("req body", req.body);

  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.editURL;
  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("This email was not found. Please try signing in again or register instead.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password. Please try again");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const pw = req.body.password;
  const password = bcrypt.hashSync(pw, 10);

  if (email === "" || pw === "") {
    // console.log("all users", users);
    return res.status(400).send("Please enter your email and a password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already registered");
  }

  users[userId] = {
    id: userId,
    email,
    password
  };
  console.log("all users", users);
  req.session.user_id = userId;
  res.redirect('/urls');

});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});