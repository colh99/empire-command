const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const buildingData = require("../game-utils/game-rules/buildings");
const shipData = require("../game-utils/game-rules/ships");
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
      const galaxyId = ObjectId.createFromHexString(req.params.galaxyId);
      const coordinates = {
        systemIndex: req.params.systemIndex,
        planetIndex: req.params.planetIndex,
      };
      const isOpen = await verifyEmptyCoordinates(res, galaxyId, coordinates);
      if (isOpen) {
        next();
      }
    }
  });
};

const constructBuilding = async (req, res, next) => {
  // Validate the building type. It should read as one of the buildings in buildingData
  const buildingTypes = Object.keys(buildingData);
  const rules = {
    building: `required|string|in:${buildingTypes.join(",")}`,
  };
  const customMessages = {
    required: "The :attribute field is required.",
    in:
      "The :attribute field must be one of the following: " +
      buildingTypes.join(", "),
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

const constructShip = async (req, res, next) => {
  // Validate the ship type. It should read as one of the ships in shipData
  const shipTypes = Object.keys(shipData);
  const rules = {
    "ship.type": `required|string|in:${shipTypes.join(",")}`,
    "ship.quantity": "required|numeric|min:1",
  };
  const customMessages = {
    required: "The :attribute field is required.",
    in:
      "The :attribute field must be one of the following: " +
      shipTypes.join(", "),
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

// Users

const createUser = async (req, res, next) => {
  const rules = {
    nickname: "required|string|min:3|max:20",
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
      // Check if the user authenticated with Auth0 has a profile in the database
      const user = await mongodb
        .getDb()
        .db("empire-command")
        .collection("users")
        .findOne({ _id: req.oidc.user.sub });
      if (user) {
        res.status(412).json({
          message: "Validation failed",
          error: { nickname: ["You already have a profile."] },
        });
      } else {
        // Check if the nickname is already taken
        const user = await mongodb
          .getDb()
          .db("empire-command")
          .collection("users")
          .findOne({ "gameProfile.nickname": req.body.nickname });
        if (user) {
          res.status(412).json({
            message: "Validation failed",
            error: { nickname: ["This nickname is already taken."] },
          });
        } else {
          next();
        }
      }
    }
  });
};

const setNickname = async (req, res, next) => {
  const rules = {
    nickname: "required|string|min:3|max:20",
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
      const user = await mongodb
        .getDb()
        .db("empire-command")
        .collection("users")
        .findOne({ "gameProfile.nickname": req.body.nickname });

      if (user) {
        res.status(412).json({
          message: "Validation failed",
          error: { nickname: ["This nickname is already taken."] },
        });
      } else {
        next();
      }
    }
  });
};

const joinGalaxy = async (req, res, next) => {
  const rules = {
    galaxyId: "required|string",
    "coordinates.systemIndex": "required|numeric",
    "coordinates.planetIndex": "required|numeric",
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
      // Get the galaxy by ID
      const galaxyId = ObjectId.createFromHexString(req.body.galaxyId);
      const galaxy = await mongodb
        .getDb()
        .db("empire-command")
        .collection("galaxies")
        .findOne({ _id: galaxyId });

      const isOpen = await verifyEmptyCoordinates(
        res,
        galaxyId,
        req.body.coordinates
      );
      if (!isOpen) {
        return;
      }

      // Check if the user has a planet in the galaxy already
      const user = await mongodb
        .getDb()
        .db("empire-command")
        .collection("users")
        .findOne({ _id: req.oidc.user.sub });
      const planet = user.gameProfile.planetsOwned.find(
        (planet) => toString(planet.galaxyId) === toString(req.body.galaxyId)
      );
      if (planet) {
        res.status(412).json({
          message: "Validation failed",
          error: {
            galaxyId: ["You already have a planet in this galaxy."],
          },
        });
        return;
      }

      next();
    }
  });
};

// Missions
const createMission = async (req, res, next) => {
  const rules = {
    targetPlanet: "required|string",
    missionType: "required|string|in:raid,transport,espionage,recycle",
    "fleet.battleCruiser": "required|numeric",
    "fleet.smallCargo": "required|numeric",
    "fleet.largeCargo": "required|numeric",
    "fleet.recycler": "required|numeric",
    "fleet.espionageProbe": "required|numeric",
    "cargo.metal": "required|numeric",
    "cargo.crystal": "required|numeric",
    "cargo.deuterium": "required|numeric",
  };
  const customMessages = {
    required: "The :attribute field is required.",
    in: "The :attribute field must be one of the following: raid, transport, espionage, recycle",
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

// Misc

const verifyEmptyCoordinates = async (res, galaxyId, coordinates) => {
  // Make sure the coordinates lead to a null planet index in the galaxy
  const givenSystemIndex = parseInt(coordinates.systemIndex);
  const givenPlanetIndex = parseInt(coordinates.planetIndex);
  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: galaxyId });
  if (galaxy) {
    if (
      galaxy.systems[givenSystemIndex] &&
      galaxy.systems[givenSystemIndex][givenPlanetIndex] === null
    ) {
      return true;
    } else {
      res
        .status(412)
        .json(
          "Invalid coordinates. The coordinates may be out of bounds or already occupied."
        );
      return false;
    }
  } else {
    res.status(404).json("Galaxy not found.");
    return false;
  }
};

const requiresAdmin = async (req, res, next) => {
  const user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .findOne({ _id: req.oidc.user.sub });

  if (user && user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      message: "You must be an admin to access this resource.",
    });
  }
};

const requiresUserExists = async (req, res, next) => {
  const user = await mongodb
    .getDb()
    .db("empire-command")
    .collection("users")
    .findOne({ _id: req.oidc.user.sub });
  if (user) {
    next();
  } else {
    res.status(403).json({
      message: "You are logged in, but have not created a profile.",
    });
  }
};

const requiresPlanetOwnership = async (req, res, next) => {
  const planetId = ObjectId.createFromHexString(req.params.planet_id);
  const planet = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .findOne({ _id: planetId });
  if (planet && planet.basicInfo.owner === req.oidc.user.sub) {
    next();
  } else {
    res.status(403).json({
      message: "You do not own this planet.",
    });
  }
};

const requiresMissionOwnership = async (req, res, next) => {
  const missionId = ObjectId.createFromHexString(req.params.mission_id);
  const mission = await mongodb
    .getDb()
    .db("empire-command")
    .collection("missions")
    .findOne({ _id: missionId });
  if (mission && mission.commandingUser === req.oidc.user.sub) {
    next();
  } else {
    res.status(403).json({
      message: "You do not own this mission.",
    });
  }
};

module.exports = {
  // Galaxies
  createGalaxy,
  updateGalaxyRulesById,
  // Planets
  createPlanet,
  constructBuilding,
  constructShip,
  // Users
  createUser,
  setNickname,
  joinGalaxy,
  // Missions
  createMission,
  // Misc
  verifyEmptyCoordinates,
  requiresAdmin,
  requiresUserExists,
  requiresPlanetOwnership,
  requiresMissionOwnership,
};
