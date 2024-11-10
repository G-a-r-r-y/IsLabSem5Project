const express = require("express");
const router = express.Router();
const User = require("../db/index");
const {
  generateRSAKeys,
  encryptMessage,
  encryptedMessageToString,
  stringToEncryptedMessageArray,
  decryptMessage,
} = require("./encryption");

const { publicKey, privateKey } = generateRSAKeys();

router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(200).json("User already exists");
    }
    const newUser = await User.create({
      username,
    });
    res.status(201).json("New user created");
  } catch (error) {
    res.status(500).json({ error: "Login process failed" });
  }
});

router.post("/add-msg", async (req, res) => {
  const { username, message } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const encryptedMessageArray = encryptMessage(message, publicKey);
    const encryptedMessageString = encryptedMessageToString(
      encryptedMessageArray
    );
    user.messages.push({
      text: encryptedMessageString,
      date: new Date(),
    });

    await user.save();
    res.status(200).json({ message: "Message added successfully", user });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/messages", async (req, res) => {
  const decryptionFunction = (msg) => {
    const encryptedArrayFromString = stringToEncryptedMessageArray(msg);
    const decryptedMessage = decryptMessage(
      encryptedArrayFromString,
      privateKey
    );
    return decryptedMessage;
  };
  try {
    const usersWithMessages = await User.find({}, "username messages");
    const messages = usersWithMessages.flatMap((user) =>
      user.messages.map((msg) => ({
        username: user.username,
        msg: msg.text,
        date: msg.date,
      }))
    );
    const decryptedData = messages.map((item) => {
      return {
        ...item,
        msg: decryptionFunction(item.msg),
      };
    });
    decryptedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(decryptedData);
  } catch (error) {
    console.error("Error fetching users and messages:", error);
    res.status(500).json({ error: "Failed to fetch users and their messages" });
  }
});

module.exports = router;
