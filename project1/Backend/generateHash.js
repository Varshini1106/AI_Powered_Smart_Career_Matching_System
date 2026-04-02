// generateHash.js
const bcrypt = require("bcryptjs");

// Change the password here to whatever your user password is
const plainPassword = "123456";

bcrypt.hash(plainPassword, 10).then(hash => {
    console.log("Hashed password:", hash);
});