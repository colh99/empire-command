const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;

// Get a single galaxy's rules by ID
const getGalaxyRulesById = async (req, res) => {
  const galaxyId = new ObjectId(req.params.id);
  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: galaxyId });
  if (galaxy) {
    res.status(200).json(galaxy.rulesConfig);
  } else {
    res.status(404).json("Galaxy not found.");
  }
};

// Get a single galaxy's users by ID
const getGalaxyUsersById = async (req, res) => {
  const galaxyId = new ObjectId(req.params.id);
  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: galaxyId });
  if (galaxy) {
    res.status(200).json(galaxy.users);
  } else {
    res.status(404).json("Galaxy not found.");
  }
};

// Get a single galaxy's systems by ID
const getGalaxySystemsById = async (req, res) => {
  const galaxyId = new ObjectId(req.params.id);
  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: galaxyId });
  if (galaxy) {
    res.status(200).json(galaxy.systems);
  } else {
    res.status(404).json("Galaxy not found.");
  }
};

// Get a single system in the galaxy by system index
const getGalaxySystemByNumber = async (req, res) => {
  const galaxyId = new ObjectId(req.params.id);
  const systemIndex = parseInt(req.params.systemIndex);
  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: galaxyId });
  if (galaxy) {
    if (systemIndex < galaxy.systems.length) {
      res.status(200).json(galaxy.systems[systemIndex]);
    } else {
      res.status(404).json("System not found.");
    }
  } else {
    res.status(404).json("Galaxy not found.");
  }
}

// Create a new galaxy
const createGalaxy = async (req, res) => {
  const newGalaxy = {
    galaxyName: req.body.galaxyName,
    rulesConfig: req.body.rulesConfig,
    systems: [],
    users: [],
  };
  // Add the systems to the galaxy. Each system has an array of 15 null planet indices.
  for (let i = 0; i < req.body.numSystems; i++) {
    newGalaxy.systems.push(
      Array(15).fill(null),
    );
  }
  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .insertOne(newGalaxy);
  if (result.acknowledged) {
    res.status(201).json(result);
  } else {
    res.status(500).json(result.error || "Failed to create galaxy.");
  }
};

// Update a galaxy's rules by ID
const updateGalaxyRulesById = async (req, res) => {
  const galaxyId = new ObjectId(req.params.id);
  const updatedRules = req.body;
  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .updateOne({ _id: galaxyId }, { $set: { rulesConfig: updatedRules } });
  if (result.acknowledged) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result.error || "Failed to update galaxy rules.");
  }
};

// Delete a galaxy
const deleteGalaxy = async (req, res) => {
  const galaxyId = new ObjectId(req.params.id);
  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .deleteOne({ _id: galaxyId });
  if (result.acknowledged) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result.error || "Failed to delete galaxy.");
  }
};

module.exports = {
  getGalaxyRulesById,
  getGalaxyUsersById,
  getGalaxySystemsById,
  getGalaxySystemByNumber,
  createGalaxy,
  updateGalaxyRulesById,
  deleteGalaxy,
};
