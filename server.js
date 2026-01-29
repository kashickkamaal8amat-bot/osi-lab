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
  res.redirect("/login.html");
});

/* ❌ WEAK LOGIN LOGIC – LAYER 7 */
app.post("/login", (req, res) => {
  const { username } = req.body;

  // ❌ Password not checked
  if (username === "Indhupriya") {
    // ❌ Weak session handling – Layer 5
    res.cookie("sessionid", "abc123xyz");
    res.redirect("/dashboard.html");
  } else {
    res.send("User not found");
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



app.listen(PORT, () => {
  console.log("🔥 OSI Lab running on port", PORT);
});