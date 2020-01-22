const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id]}
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_login", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`);
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  let user = emailHelper(email, users);
  if (user) {
    if (password === user.password) {
      res.cookie("user_id", user.id);
      return res.redirect('/urls');
    } else {
      res.send("Incorrect password.")
    }
  } else {
    res.send("Incorrect email.")
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const {email, password} = req.body;
  if (email.length === 0 || password.length === 0) {
    res.statusCode = 400; res.send('Bad Request')
  };
  if (emailHelper(email, users)) {
    res.statusCode = 400; res.send("This email address is already registered")
  }
  users[id] = {id, email, password}
  res.cookie("user_id", id);
  res.redirect('urls/');
});


function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
const emailHelper = (email, users) => {
  for(const ids in users) {
  const user = users[ids];
    if(email === user.email) {
      return user;
    }
  }
  return false;
};