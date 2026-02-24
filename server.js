const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

/* ===============================
   FAKE DATABASE
================================ */
const users = {
  indhupriya: {
    // password = "ashick"
    passwordHash: bcrypt.hashSync("ashick", 10),
  },
};

/* ===============================
   SERVER-SIDE SESSION STORE
================================ */
const sessions = {};

/* ===============================
   ROOT – LOGIN PAGE
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* ===============================
   SECURE LOGIN
================================ */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    return res.status(401).send("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(
    password,
    users[username].passwordHash
  );

  if (!validPassword) {
    return res.status(401).send("Invalid credentials");
  }

  const sessionId = crypto.randomUUID();
  sessions[sessionId] = { username };

  res.cookie("sessionid", sessionId, {
    httpOnly: true,
    sameSite: "strict",
  });

  res.redirect("/dashboard.html");
});

/* ===============================
   AUTH MIDDLEWARE
================================ */
function requireAuth(req, res, next) {
  const session = sessions[req.cookies.sessionid];

  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  req.user = session.username;
  next();
}

/* ===============================
   DASHBOARD (PROTECTED)
================================ */
app.get("/dashboard.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

/* ===============================
   ADMIN PAGE
================================ */
app.get("/admin.html", requireAuth, (req, res) => {
  if (req.user !== "indhupriya") {
    return res.status(403).send("Forbidden");
  }

  res.sendFile(path.join(__dirname, "public/admin.html"));
});

/* ===============================
   LOGOUT
================================ */
app.get("/logout", (req, res) => {
  delete sessions[req.cookies.sessionid];
  res.clearCookie("sessionid");
  res.redirect("/");
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log("🔐 Secure lab running on port", PORT);
});