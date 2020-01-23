const { assert } = require('chai');

const { generateRandomString, emailHelper, urlsForUser, httpChecker } = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  test1: { longURL: "https://www.tsn.ca", userID: "user1" },
  test2: { longURL: "https://www.google.ca", userID: "user1" },
  test3: { longURL: "https://www.google.ca", userID: "user2" },
  test4: { longURL: "https://www.google.ca", userID: "user3" }
};

describe("emailHelper", function() {
  it("should return a user with valid email", function() {
    const user = emailHelper("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it ("should return undefined if the email is not in our database", function () {
    const user = emailHelper("test@test.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  })
});

describe("generateRandomString", function() {
  it("should return a string", function() {
    const randomString = generateRandomString();
    const expectedOutput = "string";
    assert.equal((typeof randomString), expectedOutput);
  });
  it("should return a random string 6 characters long", function() {
    const randomString = generateRandomString();
    const expectedOutput = 6;
    assert.equal(randomString.length, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("should return an object", function() {
    const urls = urlsForUser(urlDatabase, "user1");
    expectedOutput = "object";
    assert.equal((typeof urls), expectedOutput);
  })

  it("should return 2 urls for user1", function() {
    const urls = urlsForUser(urlDatabase, "user1");
    expectedOutput = 2;
    assert.equal(Object.keys(urls).length, expectedOutput);
  })
});

describe("httpChecker", function() {
  it("should return 'http://google.com' for google.com", function() {
    const httpURL = httpChecker("google.com");
    expectedOutput = "http://google.com";
    assert.equal(httpURL, expectedOutput);
  })

  it("should return 'http://google.com' for http://google.com", function() {
    const httpURL = httpChecker("http://google.com");
    expectedOutput = "http://google.com";
    assert.equal(httpURL, expectedOutput);
  })
});