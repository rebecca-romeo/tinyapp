const express = require("express");
const app = express();
const PORT = 3001; // default port 8080

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});