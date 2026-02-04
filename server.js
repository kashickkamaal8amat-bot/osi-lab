const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

/* ===============================
   ROOT – LOGIN PAGE
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* ===============================
   ❌ WEAK LOGIN (USERNAME CHECK)
   - Only checks username
   - Password ignored
================================ */
app.post("/login", (req, res) => {
  const { username } = req.body;

  if (username === "Indhupriya") {
    res.cookie("sessionid", "indhupriya");
    res.redirect("/dashboard.html");
  } else {
    res.status(401).send("Unauthorized");
  }
});

/* ===============================
   ❌ COOKIE-ONLY AUTH (BYPASS)
   - Any cookie value accepted
================================ */
app.get("/dashboard.html", (req, res, next) => {
  if (req.cookies.sessionid) {
    next(); // 🔥 TRUSTS CLIENT COOKIE
  } else {
    res.status(401).send("Unauthorized");
  }
});

/* ===============================
   ❌ ADMIN AUTH VIA COOKIE VALUE
================================ */
app.get("/admin.html", (req, res) => {
  if (req.cookies.sessionid === "indhupriya") {
    res.sendFile(path.join(__dirname, "public/admin.html"));
  } else {
    res.status(401).send("Access denied");
  }
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log("🔥 Vulnerable lab running on port", PORT);
});
