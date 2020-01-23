//Helper Functions
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
const emailHelper = (email, users) => {
  for (const ids in users) {
    const user = users[ids];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};
const urlsForUser = (database, userID) => {
  const urls = {};
  for (const key in database) {
    const id = database[key];
    if (userID === id["userID"]) {
      urls[key] = {
        longURL: id["longURL"],
        userID
      };
    }
  }
  return urls;
};

module.exports = { generateRandomString, emailHelper, urlsForUser }