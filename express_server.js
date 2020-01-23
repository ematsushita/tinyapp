const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { generateRandomString, emailHelper, urlsForUser, httpChecker } = require("./helpers");


app.use(cookieSession({
  name: 'session',
  keys: ["key1"]
}));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const urlDatabase = {

};

const users = {

};

///// GET REQUESTS /////
app.get("/urls/new", (req, res) => {
  if (!(users[req.session.user_id])) {
    return res.redirect("/login");
  }
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!(req.params.shortURL in urlDatabase)) {
    return res.redirect('/urls');
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/urls/error", (req, res) => {
  let templateVars = {  user: users[req.session.user_id], error: 400, message: "400 Bad Request" };
  res.render("urls_error", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(urlDatabase, req.session.user_id), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/*", (req, res) => {
  res.redirect("/urls");
});

///// POST REQUESTS /////
app.delete("/urls/:shortURL", (req, res) => {
  const newObject = urlsForUser(urlDatabase, req.session.user_id);
  if (!(req.params.shortURL in newObject)) {
    let templateVars = {
      message: "You need to be logged in to delete or edit your URLs",
      error: 401,
      user: undefined
    };
    
    return res.render("urls_error", templateVars);
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.patch("/urls/:id", (req, res) => {
  const newObject = urlsForUser(urlDatabase, req.session.user_id);
  if (!(req.params.id in newObject)) {
    let templateVars = {
      message: "You need to be logged in to delete or edit your URLs",
      error: 401,
      user: undefined
    };
    return res.render("urls_error", templateVars);
  }
  urlDatabase[req.params.id]["longURL"] = httpChecker(req.body.newURL);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: httpChecker(req.body["longURL"]), userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = emailHelper(email, users);
  //check to see if email is valid. if valid, check to see if passwords match
  if (user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.user_id = user.id;
      return res.redirect("/urls");
    } else {
      let templateVars = {
        message: "Incorrect email and/or password",
        error: 400,
        user: undefined
      };
      return res.render("urls_error", templateVars);
    }
  } else {
    let templateVars = {
      message: "Incorrect email and/or password",
      error: 400,
      user: undefined
    };
    res.render("urls_error", templateVars);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check to see if the email address is already registered
  if (emailHelper(email, users)) {
    let templateVars = {
      user: undefined,
      error: 400,
      message: "This email address is already registered with an account."
    }
    return res.render("urls_error", templateVars);
  }
  users[id] = {id, email, hashedPassword};
  req.session.user_id = id;
  res.redirect("urls/");
});

////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});