const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
// Root route fix
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* ❌ WEAK LOGIN LOGIC – LAYER 7 */
app.post("/login", (req, res) => {
  const { username } = req.body;

  if (username === "Indhupriya") {
    res.cookie("sessionid", "abc123xyz");
    res.redirect("/dashboard.html");
  } else {
    res.status(401).send("Unauthorized: Invalid user");
  }
});

/* ❌ Session validation missing */
app.get("/dashboard.html", (req, res, next) => {
  if (req.cookies.sessionid) {
    next();
  } else {
    res.redirect("/login.html");
  }
});

/* ❌ Hidden admin page */
app.get("/admin.html", (req, res) => {
  if (req.cookies.sessionid === "abc123xyz") {
    res.sendFile(path.join(__dirname, "public/admin.html"));
  } else {
    res.send("Access denied");
  }
});
app.get("/health", (req, res) => {
  res.send("OK");
});
process.on("uncaughtException", (err) => {
  console.error("Error:", err);
});

app.listen(PORT, () => {
  console.log("🔥 OSI Lab running on port", PORT);
});