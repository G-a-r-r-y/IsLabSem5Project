// Helper function to compute the greatest common divisor
function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Helper function for modular exponentiation: (base^exp) % mod
function modularExponentiation(base, exp, mod) {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      // If exp is odd, multiply base with result
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2); // Divide exp by 2
    base = (base * base) % mod; // Square the base
  }
  return result;
}

// Function to find the modular multiplicative inverse of e mod φ(n)
function modInverse(e, phi) {
  let [t, newT] = [0, 1];
  let [r, newR] = [phi, e];
  while (newR !== 0) {
    const quotient = Math.floor(r / newR);
    [t, newT] = [newT, t - quotient * newT];
    [r, newR] = [newR, r - quotient * newR];
  }
  if (r > 1) throw new Error("e is not invertible");
  return t < 0 ? t + phi : t;
}

// RSA Key Generation (simplified for demonstration)
function generateRSAKeys() {
  const p = 61; // small prime number for example
  const q = 53; // small prime number for example
  const n = p * q; // n = 61 * 53 = 3233
  const phi = (p - 1) * (q - 1); // φ(n) = 3120

  let e = 17; // Choose e such that 1 < e < φ(n) and gcd(e, φ(n)) = 1
  while (gcd(e, phi) !== 1) {
    e++;
  }

  const d = modInverse(e, phi); // Calculate d

  return { publicKey: { e, n }, privateKey: { d, n } };
}

// Encrypt a string message using public key (e, n)
function encryptMessage(message, publicKey) {
  const { e, n } = publicKey;
  const encryptedChars = [];

  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i); // Get ASCII code of character
    const encryptedChar = modularExponentiation(charCode, e, n); // Encrypt with RSA
    encryptedChars.push(encryptedChar); // Store the encrypted integer
  }

  return encryptedChars; // Return array of encrypted integers
}

// Decrypt an array of encrypted integers using private key (d, n)
function decryptMessage(encryptedMessage, privateKey) {
  const { d, n } = privateKey;
  let decryptedMessage = "";

  for (let i = 0; i < encryptedMessage.length; i++) {
    const encryptedChar = encryptedMessage[i];
    const decryptedCharCode = modularExponentiation(encryptedChar, d, n); // Decrypt with RSA
    decryptedMessage += String.fromCharCode(decryptedCharCode); // Convert ASCII code back to character
  }

  return decryptedMessage; // Return the original message
}

// Convert the encrypted message array to a string
function encryptedMessageToString(encryptedMessageArray) {
  return encryptedMessageArray.join(","); // Join each number with a comma
}

// Convert the encrypted string back to an array for decryption
function stringToEncryptedMessageArray(encryptedString) {
  return encryptedString.split(",").map(Number); // Split by comma and convert each to a number
}

module.exports = {
  generateRSAKeys,
  encryptMessage,
  encryptedMessageToString,
  stringToEncryptedMessageArray,
  decryptMessage,
};
