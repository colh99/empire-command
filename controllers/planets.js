const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const simulation = require("../game-utils/simulation");

// Get a single planet's info by coordinates
const getPlanetByCoordinates = async (req, res) => {
  try {
    const galaxyId = ObjectId.createFromHexString(req.params.galaxyId);
    const systemIndex = parseInt(req.params.systemIndex);
    const planetIndex = parseInt(req.params.planetIndex);
    const galaxy = await mongodb
      .getDb()
      .db("empire-command")
      .collection("galaxies")
      .findOne({ _id: galaxyId });

    if (galaxy) {
      const planetId = galaxy.systems[systemIndex][planetIndex];
      const planet = await mongodb
        .getDb()
        .db("empire-command")
        .collection("planets")
        .findOne({ _id: planetId });

      // Determine the change in resource production since the last update
      const updatedPlanet = await simulation.calculateResourceProduction(
        planet,
        galaxy
      );

      if (updatedPlanet) {
        syncPlanetResources(updatedPlanet); // Update resources in the database
        res.status(200).json(updatedPlanet);
      } else {
        res.status(404).json("No planet found at these coordinates.");
      }
    } else {
      res.status(404).json("Galaxy not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Get a single planet's info by ID
const getPlanetById = async (req, res) => {
  try {
    const planetId = ObjectId.createFromHexString(req.params.planet_id);
    const planet = await mongodb
      .getDb()
      .db("empire-command")
      .collection("planets")
      .findOne({ _id: planetId });

    const galaxy = await mongodb
      .getDb()
      .db("empire-command")
      .collection("galaxies")
      .findOne({ _id: planet.galaxyId });

    // Determine the change in resource production since the last update
    const updatedPlanet = await simulation.calculateResourceProduction(
      planet,
      galaxy
    );

    if (updatedPlanet) {
      syncPlanetResources(updatedPlanet); // Update resources in the database
      res.status(200).json(updatedPlanet);
    } else {
      res.status(404).json("Planet not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Create a new planet at the given coordinates
const createPlanet = async (req, res) => {
  const galaxyId = ObjectId.createFromHexString(req.params.galaxyId);
  const givenSystemIndex = parseInt(req.params.systemIndex);
  const givenPlanetIndex = parseInt(req.params.planetIndex);
  // Construct the planet object
  const planet = {
    galaxyId: galaxyId,
    lastUpdated: new Date(),
    basicInfo: {
      owner: req.body.basicInfo.owner,
      planetName: req.body.basicInfo.planetName,
      coordinates: {
        systemIndex: givenSystemIndex,
        planetIndex: givenPlanetIndex,
      },
    },
    missionsToPlanet: [],
    missionsFromPlanet: [],
    resources: req.body.resources,
    fleet: req.body.fleet,
    buildings: req.body.buildings,
  };
  // Add the planet object to the planets collection
  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .insertOne(planet);

  if (result.acknowledged) {
    res.status(201).json(result.insertedId);
    // Update the galaxy to include a reference to the new planet at the planet's coordinates
    const updateResult = await mongodb
      .getDb()
      .db("empire-command")
      .collection("galaxies")
      .updateOne(
        { _id: galaxyId },
        {
          $set: {
            [`systems.${givenSystemIndex}.${givenPlanetIndex}`]:
              result.insertedId,
          },
        }
      );

    if (!updateResult.acknowledged) {
      res.status(500).json("Failed to update galaxy.");
    }
  } else {
    res.status(500).json("Failed to create planet.");
  }
};

// Rename a planet
const renamePlanet = async (req, res) => {
  const planetId = ObjectId.createFromHexString(req.params.planet_id);
  const newName = req.body.planetName;
  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .updateOne(
      { _id: planetId },
      {
        $set: {
          "basicInfo.planetName": newName,
        },
      }
    );

  if (result.acknowledged) {
    res.status(200).json("Planet renamed to " + newName + ".");
  } else {
    res.status(500).json("Failed to rename planet.");
  }
};

// Construct a building on a planet
const constructBuilding = async (req, res) => {
  const planetId = ObjectId.createFromHexString(req.params.planet_id);
  const building = req.body.building;
  const updateQuery = { $inc: {} };

  // Get the planet and galaxy objects
  let planet = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .findOne({ _id: planetId });

  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: planet.galaxyId });

  // Update the planet's resources
  planet = await simulation.calculateResourceProduction(planet, galaxy);

  // Check if the planet has enough resources to construct the building
  const totalCost = await simulation.checkBuildingResourceCost(
    planet,
    building
  );
  if (totalCost) {
    // Construct the building
    updateQuery.$inc[`buildings.${building}`] = 1;
  } else {
    res.status(400).json("Insufficient resources to construct building.");
    return;
  }

  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .updateOne({ _id: planetId }, updateQuery);

  if (result.acknowledged) {
    // Update the planet's resources
    planet.resources.metal -= totalCost.metal;
    planet.resources.crystal -= totalCost.crystal;
    planet.resources.deuterium -= totalCost.deuterium;
    res.status(200).json("Building constructed: " + "Level " + (planet.buildings[building] + 1) + " " + building + ".");
    syncPlanetResources(planet); // Update resources in the database
  } else {
    syncPlanetResources(planet); // Update resources in the database, without the building cost
    res.status(500).json("Failed to construct buildings.");
  }
};

// Construct ships of a given type on a planet
const constructShip = async (req, res) => {
  const planetId = ObjectId.createFromHexString(req.params.planet_id);
  const ship = req.body.ship;
  const updateQuery = { $inc: {} };

  // Get the planet and galaxy objects
  let planet = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .findOne({ _id: planetId });

  const galaxy = await mongodb
    .getDb()
    .db("empire-command")
    .collection("galaxies")
    .findOne({ _id: planet.galaxyId });

  // Update the planet's resources
  planet = await simulation.calculateResourceProduction(planet, galaxy);

  // Check if the planet has enough resources to construct the ships
  const totalCost = await simulation.checkShipResourceCost(planet, ship);
  if (totalCost) {
    // Construct the ships
    updateQuery.$inc[`fleet.${ship.type}`] = ship.quantity;
  } else {
    res.status(400).json("Insufficient resources to construct ships.");
    return;
  }

  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .updateOne({ _id: planetId }, updateQuery);

  if (result.acknowledged) {
    // Update the planet's resources
    planet.resources.metal -= totalCost.metal;
    planet.resources.crystal -= totalCost.crystal;
    planet.resources.deuterium -= totalCost.deuterium;
    res.status(200).json("Ships constructed: " + ship.quantity + " " + ship.type + ".");
    syncPlanetResources(planet); // Update resources in the database
  } else {
    syncPlanetResources(planet); // Update resources in the database, without the ship cost
    res.status(500).json("Failed to construct ships.");
  }
};

// Delete a planet. This means removing the planet reference from the galaxy according to the planet coordinates and deleting the planet object.
const deletePlanet = async (req, res) => {
  const planetId = ObjectId.createFromHexString(req.params.planet_id);
  const planet = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .findOne({ _id: planetId });

  if (planet) {
    const galaxyId = planet.galaxyId;
    const systemIndex = planet.basicInfo.coordinates.systemIndex;
    const planetIndex = planet.basicInfo.coordinates.planetIndex;
    // Remove the planet reference from the galaxy
    const updateGalaxyResult = await mongodb
      .getDb()
      .db("empire-command")
      .collection("galaxies")
      .updateOne(
        { _id: galaxyId },
        {
          $set: {
            [`systems.${systemIndex}.${planetIndex}`]: null,
          },
        }
      );
    let deleteUserPlanetRefResult;
    if (updateGalaxyResult.acknowledged) {
      // Delete the planet reference from the user's profile
      const user = await mongodb
        .getDb()
        .db("empire-command")
        .collection("users")
        .findOne({ _id: planet.basicInfo.owner });
      if (user !== null) { // If the planet does not have an owner, skip this step
        deleteUserPlanetRefResult = await mongodb
          .getDb()
          .db("empire-command")
          .collection("users")
          .updateOne(
            { _id: user._id },
            {
              $pull: {
                "gameProfile.planetsOwned": planetId,
              },
            }
          );
      } else {
        deleteUserPlanetRefResult = false; // did not remove planet reference from user profile because planet had no owner
      }
    } else {
      res.status(500).json("Failed to remove planet reference from galaxy.");
    }
    if (deleteUserPlanetRefResult.acknowledged || deleteUserPlanetRefResult == false) {
      // Delete the planet object
      const deletePlanetResult = await mongodb
        .getDb()
        .db("empire-command")
        .collection("planets")
        .deleteOne({ _id: planetId });

      if (deletePlanetResult.acknowledged) {
        res.status(200).json("Planet deleted.");
      } else {
        res.status(500).json("Failed to delete planet.");
      }
    } else {
      res
        .status(500)
        .json("Failed to remove planet reference from user profile.");
    }
  } else {
    res.status(404).json("Planet not found.");
  }
};

// Upload planet's current values to the database
const syncPlanetResources = async (planet) => {
  const result = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .updateOne(
      { _id: planet._id },
      {
        $set: {
          lastUpdated: new Date(),
          resources: planet.resources
        },
      }
    );

  return result.acknowledged;
};

module.exports = {
  getPlanetByCoordinates,
  getPlanetById,
  createPlanet,
  renamePlanet,
  constructBuilding,
  constructShip,
  deletePlanet,
  syncPlanetResources,
};
