const bcrypt = require('bcrypt');
const password = "admin123"; // Replace with your desired password
bcrypt.hash(password, 10).then(hash => console.log("HASH:", hash));