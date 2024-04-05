const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const Validator = require("validatorjs");
const validator = async (body, rules, customMessages, callback) => {
  const validation = new Validator(body, rules, customMessages);
  validation.passes(() => callback(null, true));
  validation.fails(() => callback(validation.errors, false));
};

// Galaxies

const createGalaxy = async (req, res, next) => {
  const rules = {
    galaxyName: "required|string",
    "rulesConfig.GAME_OVERALL_SPEED": "required|numeric",
    "rulesConfig.TRAVEL_SPEED": "required|numeric",
    "rulesConfig.MINING_SPEED": "required|numeric",
    "rulesConfig.BUILDING_SPEED": "required|numeric",
    numSystems: "required|numeric",
  };
  const customMessages = {
    required: "The :attribute field is required.",
    "rulesConfig.*.numeric": "The :attribute field must be a number.",
  };
  validator(req.body, rules, customMessages, (err, status) => {
    if (!status) {
      res.status(412).json({
        message: "Validation failed",
        error: err,
      });
    } else {
      next();
    }
  });
};

const updateGalaxyRulesById = async (req, res, next) => {
  const rules = {
    GAME_OVERALL_SPEED: "required|numeric",
    TRAVEL_SPEED: "required|numeric",
    MINING_SPEED: "required|numeric",
    BUILDING_SPEED: "required|numeric",
  };
  const customMessages = {
    required: "The :attribute field is required.",
    numeric: "The :attribute field must be a number.",
  };
  validator(req.body, rules, customMessages, (err, status) => {
    if (!status) {
      res.status(412).json({
        message: "Validation failed",
        error: err,
      });
    } else {
      next();
    }
  });
};

// Planets

const createPlanet = async (req, res, next) => {
  const rules = {
    "basicInfo.owner": "required|string",
    "basicInfo.planetName": "required|string",
    "resources.metal": "required|numeric",
    "resources.crystal": "required|numeric",
    "resources.deuterium": "required|numeric",
    "fleet.battleCruiser": "required|numeric",
    "fleet.smallCargo": "required|numeric",
    "fleet.largeCargo": "required|numeric",
    "fleet.recycler": "required|numeric",
    "fleet.espionageProbe": "required|numeric",
    "buildings.metalMine": "required|numeric",
    "buildings.crystalMine": "required|numeric",
    "buildings.deuteriumSynthesizer": "required|numeric",
    "buildings.solarPlant": "required|numeric",
    "buildings.fusionReactor": "required|numeric",
    "buildings.metalStorage": "required|numeric",
    "buildings.crystalStorage": "required|numeric",
    "buildings.deuteriumTank": "required|numeric",
    "buildings.shipyard": "required|numeric",
  };
  const customMessages = {
    required: "The :attribute field is required.",
  };

  validator(req.body, rules, customMessages, async (err, status) => {
    if (!status) {
      res.status(412).json({
        message: "Validation failed",
        error: err,
      });
    } else {
      // Make sure the coordinates lead to a null planet index in the galaxy
      const galaxyId = new ObjectId(req.params.galaxyId);
      const givenSystemIndex = parseInt(req.params.systemIndex);
      const givenPlanetIndex = parseInt(req.params.planetIndex);
      const galaxy = await mongodb
        .getDb()
        .db("empire-command")
        .collection("galaxies")
        .findOne({ _id: galaxyId });
      if (galaxy) {
        if (galaxy.systems[givenSystemIndex] && galaxy.systems[givenSystemIndex][givenPlanetIndex] === null) {
          next();
        } else {
          res.status(412).json("Invalid coordinates. The coordinates may be out of bounds or already occupied.");
        }
      } else {
        res.status(404).json("Galaxy not found.");
      }
    }
  });
};

module.exports = {
  createGalaxy,
  updateGalaxyRulesById,

  createPlanet,
};
