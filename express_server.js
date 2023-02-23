const express = require("express");
const app = express();
const PORT = 3001; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


// QUESTION: Check if all the routes are in the right order?

// Route: Homepage - Displays Hello string
app.get("/", (req, res) => {
  res.send("Hello!");
});


// Route: get urls - form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Route: post urls - form
app.post("/urls", (req, res) => {
  // On post, generate a random string
  const randomString = generateRandomString();

  console.log(req.body); // Log the POST request body to the console
  console.log("random shorturl:", randomString)

  // Add the random string to the database as a key, and the value is the longurl that the user submitted
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase)

  // Redirect the user to the urls/:id page
  res.redirect(`/urls/${randomString}`);
});

// Route: short url takes user to the website
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// Route: urls/id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Route: urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});







// Route: urls.json - Displays urlDatabase as json string
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


// Route: hello - Displays Hello World using html
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});