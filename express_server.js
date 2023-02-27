const express = require("express");
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
///////// DATABASES
// *************************

// const plainpw = "dishwasher-funk";
// const salt = bcrypt.genSaltSync(10);
// const hash = bcrypt.hashSync(plainpw, salt);
// console.log(hash)

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$LkYyf7ztCYVaOLY1E4NLO.NZp.GHK66tjRiVU6gAawrneD8MRcZsO",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$9PpncpNh6z8sTIIOT6UP0.8msE.M//zO080OoMT6Eqyhoxhip5sdW",
  },
};

// Database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// *************************
///////// FUNCTIONS
// *************************
const getUserByEmail = function(email) {
  const userValues = Object.values(users);
  for(const user of userValues) {
    if(user.email === email) {
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


// *************************
////////// ROUTES
// *************************

// Route: Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route: get register
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  }

  const userId = req.session.user_id;
  const user = users[userId];

  // if user is logged in and tries going to the register page, redirect them to urls
  if(user) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});

// Route: post register
app.post("/register", (req, res) => {
  // create a random id
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).send("Please enter your email and a password")
  }

  if(getUserByEmail(email)) {
    return res.status(400).send("This email is already registered")
  }

    // add the new user & info to the global users object
    users[userId] = {
      id: userId,
      email: email,
      password: bcrypt.hashSync(password, 10)
    }

    console.log(users)

  // res.cookie('user_id', userId);
  req.session.user_id = userId;
  res.redirect('/urls');
});

// Route:  get login
// user types a username in form (_header.ejs), hits submit.
// A cookie is create with their login name and value. Once logged in, user is redirected to /urls
app.get("/login", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  // if user is logged in and tries going to the login page, redirect them to urls
  if(user) {
    return res.redirect('/urls');
  }

  res.render('login', {user: null});
});


// Route: post login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if(!user) {
    return res.status(403).send("This email was not found. Please try signing in again or register instead.")
  }
  // if(password !== user.password)
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password. Please try again")
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


// Route: submit url
// a form (from urls_new ejs). user types a website and hits submit
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };

  if(!templateVars.user) {
    return res.redirect('/login')
  }

  res.render("urls_new", templateVars);
});

// Route: post submitted url
// after user submits the website, a short url is generated
// user is then redirected to urls/tinyurl to see their newly generate tiny url and corresponding long url
// (uses longURL / submit button from urls_new ejs)
app.post("/urls", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  if(!user) {
    return res.status(403).send("You must be logged in to view this page")
  }

  // On post, generate a random string
  const randomString = generateRandomString();

  // Add the random string to the database as a key, and the value is the longurl that the user submitted
  urlDatabase[randomString] = req.body.longURL;

  // Redirect the user to the urls/:id page
  res.redirect(`/urls/${randomString}`);
});

// Route: short url id
// use a tiny url id and redirects user to the real website
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    res.status(404).send("That shortened URL does not exist. Please try again.");
  } else {
    res.redirect(longURL);
  }
});


// Route: urls/id
// page after the user creates a tiny url
// user can view the short and long url & edit to the long url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Route: delete row
// button deletes entire line of short and long url that was saved (button in urls_index)
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Route: edit longurl
//takes the longurl the user submit and replaces the original url (form in urls_show ejs)
app.post("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const longURL = req.body.editURL;
  urlDatabase[shortID] = longURL;
  res.redirect('/urls');
});


// Route: urls
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    urls: urlDatabase };

  if(!templateVars.user) {
    return res.status(403).send(`You must be logged in to view this page. Click <a href="/login"> here</a> to login, or register <a href="/register"> here</a> if you do not have an account.`)
  }

  res.render("urls_index", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});