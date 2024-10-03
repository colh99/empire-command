const mongodb = require("../db/connect");

/**
 * Runs all mission events, in order
 *
 */
async function runAllMissionEvents() {
  // Get all active missions
  console.log("Running all mission events");
  const missions = await mongodb
    .getDb()
    .db("empire-command")
    .collection("missions")
    .find({ active: true })
    .toArray();

  console.log("Active missions", missions);
  // Get the current time to compare against mission times
  const currentTime = new Date();

  // Each mission has an arrival and return time. Use these to create a list of events objects, containing the mission and the event type and the time of the event
  const events = missions.map((mission) => {
    if (currentTime >= mission.arrivalTime && mission.status === "en route") {
      return { mission, type: "fleet arrival" };
    } else if (currentTime >= mission.returnTime && mission.status === "returning") {
      return { mission, type: "fleet return" };
    }
  }
  ).filter((event) => event !== undefined);
  
  console.log("Events:");
  events.forEach((event) => {
    console.log("missionId: ", event.mission._id);
    console.log("type: ", event.type);
    console.log("departureTime: ", event.mission.departureTime.toLocaleString());
    console.log("arrivalTime: ", event.mission.arrivalTime.toLocaleString());
    console.log("returnTime: ", event.mission.returnTime.toLocaleString());
    console.log("active: ", event.mission.active);
    console.log("status: ", event.mission.status);
    console.log("missionType: ", event.mission.missionType);
    console.log("fleet: ", event.mission.fleet);
    console.log("cargo: ", event.mission.cargo);
  });

  // Run all events
  for (const event of events) {
    console.log(`Running event: ${event.type} for mission ${event.mission._id}`);
    if (event.type === "fleet arrival") {
      await processFleetArrival(event.mission);
    } else if (event.type === "fleet return") {
      await processFleetReturn(event.mission);
    }
  }
}

/**
 * Simply determine which mission event to run
 * @param mission
 */
const processFleetArrival = async (mission) => {
  if (mission.missionType === "cargo") {
    console.log("Processing cargo arrival");
    await processCargoArrival(mission);
  } else if (mission.missionType === "raid") {
    await processRaidArrival(mission);
  } else if (mission.missionType === "transport") {
    await processTransportArrival(mission);
  } else if (mission.missionType === "espionage") {
    await processEspionageArrival(mission);
  } else if (mission.missionType === "recycle") {
    await processRecycleArrival(mission);
  }
};

/**
 * Delivers any cargo to the destination planet
 * @param mission mission object
 * @param targetPlanet target planet object
 * @returns The updated planet and mission objects
 */
const processCargoArrival = async (mission) => {
  const targetPlanet = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .findOne({ _id: mission.targetPlanet });

  // Add the cargo to the target planet
  targetPlanet.resources.metal += mission.cargo.metal;
  targetPlanet.resources.crystal += mission.cargo.crystal;
  targetPlanet.resources.deuterium += mission.cargo.deuterium;
  
  console.log("Cargo has arrived at the target planet: ", targetPlanet, "delivering", mission.cargo);
  // Update the mission cargo and set status to "returning"
  mission.cargo.metal = 0;
  mission.cargo.crystal = 0;
  mission.cargo.deuterium = 0;
  mission.status = "returning";


  // Update the target planet in the database
  await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .updateOne(
      { _id: mission.targetPlanet },
      {
        $set: {
            resources: targetPlanet.resources,
        },
      }
    );

  // Update the mission in the database
  await mongodb
    .getDb()
    .db("empire-command")
    .collection("missions")
    .updateOne(
      { _id: mission._id },
      {
        $set: {
          cargo: mission.cargo,
          status: mission.status,
        },
      }
    );
};

/**
 * Processes a fleet return. Mission status is set to "completed", active is set to false,
 * and the fleet and any resources are added to the origin planet.
 * @param mission mission object
 * @param originPlanet origin planet object
 */
const processFleetReturn = async (mission) => {
  console.log("Processing fleet return");

  const originPlanet = await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .findOne({ _id: mission.originPlanet });

  console.log("Planet fleet before return", originPlanet.fleet);
  console.log("Mission fleet", mission.fleet);

  // Add the values of each ship type from the fleet to the origin planet's fleet
  for (const shipType in mission.fleet) {
    originPlanet.fleet[shipType] += mission.fleet[shipType];
  }

  console.log("Planet fleet after return", originPlanet.fleet);

  console.log("Planet resources added by the fleet", mission.cargo);

  // Add any resources to the origin planet
  originPlanet.resources.metal += mission.cargo.metal;
  originPlanet.resources.crystal += mission.cargo.crystal;
  originPlanet.resources.deuterium += mission.cargo.deuterium;

  // Update the mission status and active flag
  mission.status = "completed";
  mission.active = false;

  // Update the origin planet in the database
  await mongodb
    .getDb()
    .db("empire-command")
    .collection("planets")
    .updateOne(
      { _id: mission.originPlanet },
      {
        $set: {
          fleet: originPlanet.fleet,
          resources: originPlanet.resources,
        },
      }
    );

  // Update the mission in the database
  await mongodb
    .getDb()
    .db("empire-command")
    .collection("missions")
    .updateOne(
      { _id: mission._id },
      {
        $set: {
          status: mission.status,
          active: mission.active,
        },
      }
    );
};

module.exports = {
  runAllMissionEvents
};
