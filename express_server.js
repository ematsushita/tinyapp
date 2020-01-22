const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  if (!(users[req.cookies["user_id"]])) {
    res.redirect("/login")
  }
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
  let templateVars = { urls: urlsForUser(urlDatabase, req.cookies.user_id), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/error", (req, res) => {
  let templateVars = {  user: users[req.cookies.user_id], error: 400, message: "400 Bad Request" };
  res.render("urls_error", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  //if(!(users[req.cookies.user_id])) {res.redirect("/login")}

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.cookies.user_id] 
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
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
  urlDatabase[shortURL] = { longURL: req.body["longURL"], userID: req.cookies.user_id }
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const newObject = urlsForUser(urlDatabase, req.cookies.user_id)
  if(!(req.params.shortURL in newObject)) {return res.redirect("/urls/error")}

  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`);
});


app.post("/urls/:id", (req, res) => {
  const newObject = urlsForUser(urlDatabase, req.cookies.user_id)
  if(!(req.params.id in newObject)) {return res.redirect("/urls/error")}

  urlDatabase[req.params.id]["longURL"] = req.body.newURL;
  res.redirect('/urls');
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
    res.redirect("/urls/error")
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
    res.statusCode = 400; res.redirect("/urls/error")
  };
  if (emailHelper(email, users)) {
    res.statusCode = 400; res.redirect("/urls/error")
  }
  users[id] = {id, email, password}
  res.cookie("user_id", id);
  res.redirect('urls/');
});

//Helper Functions
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
const urlsForUser = ((database, userID) => {
  const urls = {};
  for (const key in database) {
    const id = database[key];
    if (userID === id["userID"]) {
      urls[key] = {
        longURL: id["longURL"],
        userID
      }
    }
  }
  return urls;
})