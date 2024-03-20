const mongodb = require("../db/connect");

// Get a single galaxy's rules by ID
const getGalaxyRulesById = async (req, res) => {};

// Get a single galaxy's users by ID
const getGalaxyUsersById = async (req, res) => {};

// Get a single galaxy's systems by ID
const getGalaxySystemsById = async (req, res) => {};

// Get a single system in the galaxy by system number
const getGalaxySystemBySystem = async (req, res) => {};

// Create a new galaxy
const createGalaxy = async (req, res) => {
  const db = mongodb.getDb().db("empire-command").collection("galaxies");
  const galaxy = req.body;
  try {
    const result = await db.insertOne(galaxy);
    res.status(201).json({ message: "Galaxy created!", galaxy: galaxy });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Galaxy creation failed." });
  }
};

// Update a galaxy's rules by ID
const updateGalaxyRulesById = async (req, res) => {};

// Delete a galaxy
const deleteGalaxy = async (req, res) => {};

module.exports = {
  getGalaxyRulesById,
  getGalaxyUsersById,
  getGalaxySystemsById,
  getGalaxySystemBySystem,
  createGalaxy,
  updateGalaxyRulesById,
  deleteGalaxy,
};
