const bcrypt = require("bcrypt");
const saltRounds = 10;

const isEmpty = (val) => {
  return val === undefined ||
    val == null ||
    val.length == 0 ||
    Object.keys(val).length === 0
    ? true
    : false;
};

const saltAndHashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  return { salt, hashedPassword };
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

function generateOtp() {
  return Math.floor(Math.random() * 1000000).toString();
}
function determineTierType(post_count) {
  if (post_count >= 1) return "basic";
  return null;
}

function generateRandomPassword(length = 12) {
  if (length < 8) {
    throw new Error(
      "Password length should be at least 8 characters for better security."
    );
  }

  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const special = "!@#$%^&*()_+[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + digits + special;

  // Ensure at least one from each category
  const getRandom = (chars) => chars[Math.floor(Math.random() * chars.length)];

  let result = [
    getRandom(lowercase),
    getRandom(uppercase),
    getRandom(digits),
    getRandom(special),
  ];

  for (let i = result.length; i < length; i++) {
    result.push(getRandom(allChars));
  }

  // Shuffle result to prevent predictable character positions
  result = result.sort(() => Math.random() - 0.5);

  return result.join("");
}

module.exports = {
  isEmpty,
  saltAndHashPassword,
  comparePassword,
  generateOtp,
  determineTierType,
  generateRandomPassword,
};
