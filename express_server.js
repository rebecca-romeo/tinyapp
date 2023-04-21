const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// ---- FUNCTIONS -----
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // console.log(characters.charAt(0))
  // console.log(result)
  return result;
};


const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
};

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
  // **** const username = req.cookies["username"];
  const user = users[req.cookies['user_id']];

  if (!user) {
    res.redirect("/login")
  }

  const templateVars = { urls: urlDatabase, user };
  console.log("temp vars:", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // **** const username = req.cookies["username"];
  const user = users[req.cookies['user_id']];

  if (!user) {
    res.redirect("/login")
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // **** const username = req.cookies["username"];
  const user = users[req.cookies['user_id']];
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
});

app.get("/register", (req, res) => {
  // *** const username = req.cookies["username"];
  const user = users[req.cookies['user_id']];

  if (user) {
    res.redirect('/urls')
  }

  const templateVars = { user };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies['user_id']];

  if (user) {
    res.redirect('/urls')
  }

  const templateVars = { user };
  res.render('login', templateVars);
});


// ---- POST ROUTES -----
app.post("/urls", (req, res) => {
  const user = users[req.cookies['user_id']];
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

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  // const password = req.body.password;
  // const hashedPassword = bcrypt.hashSync(password, 10);
  const pw = req.body.password;
  const password = bcrypt.hashSync(pw, 10);

  if (email === "" || password === "") {
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
  res.cookie('user_id', userId);
  res.redirect('/urls');

});


app.post("/logout", (req, res) => {
  // **** res.clearCookie('username', req.body.username);
  res.clearCookie('user_id', users['user_id']);
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});