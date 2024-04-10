const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("./db/connect");

const port = process.env.PORT || 3000;
const app = express();

const { auth, requiresAuth } = require("express-openid-connect");

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: 'https://empire-command-api.onrender.com',
  //baseURL: "http://localhost:3000",
  clientID: "qdQwjXUiTSsy0dsrJgr4FQHnTC0NzYTr",
  issuerBaseURL: "https://dev-wd8d1nsmhc0xwqfo.us.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get("/", async (req, res) => {
  // Add user to MongoDB if authenticated
  if (req.oidc.isAuthenticated()) {
    const userProfile = req.oidc.user;

    // Check if user exists in MongoDB
    let user = await mongodb
      .getDb()
      .db("empire-command")
      .collection("users")
      .findOne({ _id: userProfile.sub });

    // If user doesn't exist, create a new user
    if (!user) {
      user = await mongodb
        .getDb()
        .db("empire-command")
        .collection("users")
        .insertOne({
          _id: userProfile.sub,
          email: userProfile.email,
          gameProfile: {
            nickname: userProfile.nickname,
            galaxiesJoined: [],
            planetsOwned: [],
          },
        });
    }
  }
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app
  .use(bodyParser.json())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Z-Key"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    next();
  })
  .use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
  })
  .use("/", require("./routes"));

process.on("uncaughtException", (err, origin) => {
  console.log(
    process.stderr.fd,
    `Caught exception: ${err}\n` + `Exception origin ${origin}`
  );
});

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port);
    console.log("Connected to DB and listening on port " + port);
  }
});
