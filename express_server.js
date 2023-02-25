const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

const PORT = 3001; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// *************************
// DATABASES
// *************************
// Users database
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

// Database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// *************************
// FUNCTIONS
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
// ROUTES
// *************************

// QUESTION: Check if all the routes are in the right order?

// Route: Homepage - Displays Hello string
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route: register
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('register', templateVars);
});

// Route: register
app.post("/register", (req, res) => {
  // create a random id
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;



    console.log(users);
  // create a cookie with the user's id

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
      password: password
    }

  res.cookie('user_id', userId);
  res.redirect('/urls');
});



// Route: login
// user types a username in form (_header.ejs), hits submit.
// A cookie is create with their login name and value. Once logged in, user is redirected to /urls
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});


// Route: logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


// Route: submit url
// a form (from urls_new ejs)
// use types a website and hits submit
app.get("/urls/new", (req, res) => {
  const templateVars = {
    // *****************
    user: users[req.cookies['user_id']]
    // *****************
  };
  res.render("urls_new", templateVars);
});

// Route: post submitted url
// after user submits the website, a short url is generated
// user is then redirected to urls/tinyurl to see their newly generate tiny url and corresponding long url
// (uses longURL / submit button from urls_new ejs)
app.post("/urls", (req, res) => {
  // On post, generate a random string
  const randomString = generateRandomString();

  // Add the random string to the database as a key, and the value is the longurl that the user submitted
  urlDatabase[randomString] = req.body.longURL;


  // Redirect the user to the urls/:id page
  res.redirect(`/urls/${randomString}`);
});

// Route: short url id redirects to long url website
// use a tiny url id and brings user to the real website
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// Route: urls/id
// page after the user creates a tiny url
// user can view the short and long url
// user can make an edit to the long url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    // *****************
    user: users[req.cookies['user_id']],
    // *****************
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Route: delete row
//user clicks delete button, deletes the entire line of short and long url that was saved (button in urls_index)
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
// *****************
    user: users[req.cookies['user_id']],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});







// Route: urls.json - Displays urlDatabase as json string
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});