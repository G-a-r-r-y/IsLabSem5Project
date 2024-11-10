const express = require("express");
const router = express.Router();
const User = require("../db/index");

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
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

    // Push the message as an object with 'text' and 'date'
    user.messages.push({
      text: message,
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
  try {
    const usersWithMessages = await User.find({}, "username messages");
    const messages = usersWithMessages.flatMap((user) =>
      user.messages.map((msg) => ({
        username: user.username,
        msg: msg.text,
        date: msg.date,
      }))
    );
    messages.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(messages);
  } catch (error) {
    console.error("Error fetching users and messages:", error);
    res.status(500).json({ error: "Failed to fetch users and their messages" });
  }
});

module.exports = router;
