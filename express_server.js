const express = require("express");
const app = express();
const PORT = 3001; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Route: Homepage - Displays Hello string
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route: urls.json - Displays urlDatabase as json string
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route: hello - Displays Hello World using html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// ---------------------------------------------
// Test: variable accessibility between requests

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
// END test --------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});