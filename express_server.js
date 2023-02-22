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




// Route: Homepage - Displays Hello string
app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Route: urls/id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: req.params.longURL /*  What goes here? */ };
  res.render("urls_show", templateVars);
});

// Route: urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Route: post urls
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  console.log("random shorturl:", randomString)
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});





// Route: urls.json - Displays urlDatabase as json string
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


// Route: hello - Displays Hello World using html
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// ---------------------------------------------
// Test: variable accessibility between requests

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
// did not work in fetch
// END test --------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});