const express = require("express");
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
  const templateVars = { urls: urlDatabase, user };
  console.log("temp vars:", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // **** const username = req.cookies["username"];
  const user = users[req.cookies['user_id']];
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
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  // *** const username = req.cookies["username"];
  const user = users[req.cookies['user_id']];
  const templateVars = { user };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { user };
  res.render('login', templateVars);
});


// ---- POST ROUTES -----
app.post("/urls", (req, res) => {
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

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

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

app.post("/login", (req, res) => {
  // console.log("res body in login", req.body.username);
  // **** res.cookie('username', req.body.username);
  // const user = users[req.cookies['user_id']];
  // res.cookie('user', users['user_id'])
  res.cookie('user_id', users['user_id']);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  // **** res.clearCookie('username', req.body.username);
  res.clearCookie('user_id', users['user_id']);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});