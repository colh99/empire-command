const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const simulation = require("../game-utils/simulation");

// Get a single mission's info by ID
const getMissionById = async (req, res) => {
  console.log("Getting single mission by ID:");
  try {
    const missionId = ObjectId.createFromHexString(req.params.id);
    const mission = await mongodb
      .getDb()
      .db("empire-command")
      .collection("missions")
      .findOne({ _id: missionId });

    if (mission) {
      res.status(200).json(mission);
    } else {
      res.status(404).json("No mission found with this ID.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Get all active missions
const getActiveMissions = async (req, res) => {
  try {
    const missions = await mongodb
      .getDb()
      .db("empire-command")
      .collection("missions")
      .find({ active: true })
      .toArray();

    if (missions) {
      res.status(200).json(missions);
    } else {
      res.status(404).json("No active missions found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Get all active missions from a user by user ID
const getActiveMissionsByUserId = async (req, res) => {
  try {
    const missions = await mongodb
      .getDb()
      .db("empire-command")
      .collection("missions")
      .find({ commandingUser: req.params.user_id, active: true })
      .toArray();

    if (missions) {
      res.status(200).json(missions);
    } else {
      res.status(404).json("No active missions found for this user.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Get all active missions from the current user
const getActiveMissionsByCurrentUser = async (req, res) => {
  console.log("Getting active missions for current user:");
  try {
    const missions = await mongodb
      .getDb()
      .db("empire-command")
      .collection("missions")
      .find({ commandingUser: req.oidc.user.sub, active: true })
      .toArray();

    if (missions) {
      res.status(200).json(missions);
    } else {
      res.status(404).json("No active missions found for this user.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Create a new mission
const createMission = async (req, res) => {
  try {
    const originPlanetId = ObjectId.createFromHexString(req.params.planet_id);
    const originPlanet = await mongodb
      .getDb()
      .db("empire-command")
      .collection("planets")
      .findOne({ _id: originPlanetId });

    const targetPlanetId = ObjectId.createFromHexString(req.body.targetPlanet);
    const targetPlanet = await mongodb
      .getDb()
      .db("empire-command")
      .collection("planets")
      .findOne({ _id: targetPlanetId });

    // Determine travel times
    const hoursTravelTime = await simulation.determineTravelTime(
      originPlanet,
      targetPlanet,
      req.body.fleet
    );

    if (targetPlanet) {
      const mission = {
        commandingUser: req.oidc.user.sub,
        originPlanet: originPlanetId,
        targetPlanet: targetPlanetId,
        departureTime: new Date(),
        arrivalTime: new Date(
          new Date().getTime() + hoursTravelTime * 60 * 60 * 1000
        ),
        returnTime: new Date(
          new Date().getTime() + hoursTravelTime * 2 * 60 * 60 * 1000
        ),
        active: true,
        status: "en route",
        missionType: req.body.missionType,
        fleet: req.body.fleet,
        cargo: req.body.cargo,
      };

      console.log("Departure time:", mission.departureTime.toLocaleString());
      console.log("Arrival time:", mission.arrivalTime.toLocaleString());
      console.log("Return time:", mission.returnTime.toLocaleString());

      // Get the galaxy for the origin planet
      const galaxy = await mongodb
        .getDb()
        .db("empire-command")
        .collection("galaxies")
        .findOne({ _id: originPlanet.galaxyId });

      // Update the origin planet's resources
      simulation.updatePlanetResources(originPlanet, galaxy);
      // Check if the mission parameters are valid
      const isFleetLaunched = await simulation.launchFleet(originPlanet, mission);
      if (isFleetLaunched !== true) {
        res.status(400).json(isFleetLaunched);
        return;
      };
      
      const result = await mongodb
        .getDb()
        .db("empire-command")
        .collection("missions")
        .insertOne(mission);

      res.status(201).json(result);
    } else {
      res.status(404).json("No target planet found with this ID.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Recall a mission by ID
const recallMission = async (req, res) => {
  try {
    const missionId = ObjectId.createFromHexString(req.params.mission_id);
    const mission = await mongodb
      .getDb()
      .db("empire-command")
      .collection("missions")
      .findOne({ _id: missionId });

    if (mission) {
      if (mission.status === "en route") {
        // Calculate new return time based on time since departure
        const currentTime = new Date();
        const timeElapsed = currentTime - mission.departureTime;
        const newReturnTime = new Date(currentTime.getTime() + timeElapsed);

        console.log(
          "Recalling mission. New return time:",
          newReturnTime.toLocaleString()
        );

        await mongodb
          .getDb()
          .db("empire-command")
          .collection("missions")
          .updateOne(
            { _id: missionId },
            {
              $set: {
                status: "returning(aborted)",
                active: true,
                returnTime: newReturnTime,
              },
            }
          );

        res.status(200).json("Mission recalled.");
      } else {
        res.status(400).json("Mission cannot be recalled.");
      }
    } else {
      res.status(404).json("No mission found with this ID.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

// Delete a mission by ID
const deleteMission = async (req, res) => {
  try {
    const missionId = ObjectId.createFromHexString(req.params.id);
    const mission = await mongodb
      .getDb()
      .db("empire-command")
      .collection("missions")
      .findOne({ _id: missionId });

    if (mission) {
      await mongodb
        .getDb()
        .db("empire-command")
        .collection("missions")
        .deleteOne({ _id: missionId });

      res.status(200).json("Mission deleted.");
    } else {
      res.status(404).json("No mission found with this ID.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred.");
  }
};

module.exports = {
  getMissionById,
  getActiveMissions,
  getActiveMissionsByUserId,
  getActiveMissionsByCurrentUser,
  createMission,
  recallMission,
  deleteMission,
};
