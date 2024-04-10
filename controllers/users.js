const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const simulation = require("../game-utils/simulation");

// Get a user by ID
const getCurrentUser = async (req, res) => {
  // Find the user in the database
  let user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .findOne({ _id: req.oidc.user.sub });

  if (user) {
    res.send(user);
  } else {
    res.send("User not found.");
  }
};

// Get a user by nickname
const getUserByNickname = async (req, res) => {
  const nickname = req.params.nickname;
  // Find the user in the database
  let user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .findOne(
      { "gameProfile.nickname": nickname },
      { projection: { gameProfile: 1, _id: 0 } }
    );

  if (user) {
    res.send(user.gameProfile);
  } else {
    res.send("User not found.");
  }
};

// Set a user's own nickname
const setNickname = async (req, res) => {
  nickname = req.body.nickname;
  // Find the current logged in user in the database
  let user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .findOne({ _id: req.oidc.user.sub });

  // Update the user's nickname
  user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .updateOne(
      { _id: req.oidc.user.sub },
      { $set: { "gameProfile.nickname": nickname } }
    );

  if (user) {
    res.send("Nickname updated successfully.");
  } else {
    res.send("Nickname update failed.");
  }
};

// Join a galaxy as the current logged in user
const joinGalaxy = async (req, res) => {
  const galaxyId = new ObjectId(req.body.galaxyId);
  const coordinates = req.body.coordinates;
  // Find the current logged in user in the database
  let user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .findOne({ _id: req.oidc.user.sub });

  // Get the galaxy by ID
  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: galaxyId });

  // Give the player a planet in the galaxy
  const planet = await simulation.colonizePlanet(user, galaxy, coordinates);

  // Add the planet to the database and store the new planet ID
  const planetId = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .insertOne(planet)
    .then((result) => result.insertedId);

  if (!planetId) {
    res.status(500).json({ message: "Failed to create planet." });
    return;
  }

  // Add the planet ID to the galaxy in the correct coordinates
  galaxy.systems[coordinates.systemIndex][coordinates.planetIndex] = planetId;

  // Add the user to the galaxy
  galaxy.users.push(user._id);

  // Update the galaxy in the database
  const galaxyUpdate = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .updateOne({ _id: galaxyId }, { $set: galaxy });

  if (!galaxyUpdate) {
    res.status(500).json({ message: "Failed to update galaxy." });
    return;
  }

  // Update the user's galaxiesJoined and planetsOwned
  user.gameProfile.galaxiesJoined.push(galaxyId);
  user.gameProfile.planetsOwned.push(planetId);
  const userUpdate = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .updateOne(
      { _id: req.oidc.user.sub },
      { $set: { gameProfile: user.gameProfile } }
    );

  if (!userUpdate) {
    res.status(500).json({ message: "Failed to update user." });
    return;
  } else {
    res.status(200).json({ message: "Successfully joined galaxy." });
  }
};

module.exports = {
  getCurrentUser,
  getUserByNickname,
  setNickname,
  joinGalaxy,
};
