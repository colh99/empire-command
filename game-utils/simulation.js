const buildingData = require("../game-utils/game-rules/buildings");
const shipData = require("../game-utils/game-rules/ships");

/**
 * Updates the resources of a planet based on the time difference since the last update.
 * @param  {[object]} planet Planet object to update
 * @param  {[object]} galaxy Galaxy object to get the game rules from
 * @return {[object]}       Returns the updated planet object
 * @async
 */
const calculateResourceProduction = async (planet, galaxy) => {
  if (planet && galaxy) {
    // Calculate the time difference
    const currentTime = new Date();
    const timeDifference = (currentTime - planet.lastUpdated) / 1000;
    const timeDifferenceInHours = timeDifference / 3600;

    // Calculate the new resources based on the time difference. 
    // Use the buildingData object to get the resource production rates, 
    // multiplied by the number of buildings of that type on the planet.
    const galaxyMiningSpeedModifier =
      galaxy.rulesConfig.MINING_SPEED * galaxy.rulesConfig.GAME_OVERALL_SPEED;

    addedMetal =
      buildingData.metalMine.output *
      planet.buildings.metalMine *
      timeDifferenceInHours *
      galaxyMiningSpeedModifier;
    addedCrystal =
      buildingData.crystalMine.output *
      planet.buildings.crystalMine *
      timeDifferenceInHours *
      galaxyMiningSpeedModifier;
    addedDeuterium =
      buildingData.deuteriumSynthesizer.output *
      planet.buildings.deuteriumSynthesizer *
      timeDifferenceInHours *
      galaxyMiningSpeedModifier;

    const updatedResources = {
      metal: planet.resources.metal + addedMetal,
      crystal: planet.resources.crystal + addedCrystal,
      deuterium: planet.resources.deuterium + addedDeuterium,
    };

    console.log("--UPDATE PLANET RESOURCES");
    console.log("Old resources: ", planet.resources);
    console.log("Time difference in hours: ", timeDifferenceInHours);
    console.log(
      "Added Metal:",
      addedMetal,
      "Crystal:",
      addedCrystal,
      "Deuterium:",
      addedDeuterium
    );
    console.log("Updated resources: ", updatedResources);

    // Return the updated planet
    return {
      ...planet,
      resources: updatedResources
    };
  }
};

/**
 * Determines if the planet has enough resources to construct the building.
 * @param  {[object]} planet The planet object being constructed on
 * @param  {[string]} building The building to be constructed
 * @return {[object]} Returns the total cost of the building if the planet has enough resources, otherwise returns false.
 * @async
 */
const checkBuildingResourceCost = async (planet, building) => {
  if (planet && building) {
    const totalCost = {
      metal: buildingData[building].cost.metal,
      crystal: buildingData[building].cost.crystal,
      deuterium: buildingData[building].cost.deuterium,
    };

    console.log("--CHECK BUILDING RESOURCE COST");
    console.log("Building:", building);
    console.log("Total cost: ", totalCost);
    console.log("Planet resources after cost: ", {
      metal: planet.resources.metal - totalCost.metal,
      crystal: planet.resources.crystal - totalCost.crystal,
      deuterium: planet.resources.deuterium - totalCost.deuterium,
    });

    // Check if the planet has enough resources
    if (
      planet.resources.metal >= totalCost.metal &&
      planet.resources.crystal >= totalCost.crystal &&
      planet.resources.deuterium >= totalCost.deuterium
    ) {
      return totalCost;
    } else {
      console.log("Not enough resources to build.");
      return false;
    }
  }
};

/**
 * Determines if the planet has enough resources to construct the ship.
 * @param  {[object]} planet The planet object being constructed on
 * @param  {[object]} ship The ship.type and ship.quantity to be constructed
 * @return {[object]} Returns the total cost of the ship if the planet has enough resources, otherwise returns false.
 * @async
 */
const checkShipResourceCost = async (planet, ship) => {
  if (planet && ship) {
    const totalCost = {
      metal: shipData[ship.type].cost.metal * ship.quantity,
      crystal: shipData[ship.type].cost.crystal * ship.quantity,
      deuterium: shipData[ship.type].cost.deuterium * ship.quantity,
    };

    console.log("--CHECK SHIP RESOURCE COST");
    console.log("Ship:", ship);
    console.log("Total cost: ", totalCost);
    console.log("Planet resources after cost: ", {
      metal: planet.resources.metal - totalCost.metal,
      crystal: planet.resources.crystal - totalCost.crystal,
      deuterium: planet.resources.deuterium - totalCost.deuterium,
    });

    // Check if the planet has enough resources
    if (
      planet.resources.metal >= totalCost.metal &&
      planet.resources.crystal >= totalCost.crystal &&
      planet.resources.deuterium >= totalCost.deuterium
    ) {
      return totalCost;
    } else {
      console.log("Not enough resources to build.");
      return false;
    }
  }
};

/**
 * Colonizes a planet for a user in a galaxy at the given coordinates.
 * @param  {[object]} user The user object to give the planet to
 * @param  {[object]} galaxy The galaxy object to place the planet in
 * @param  {[object]} coordinates The coordinates of the planet in the galaxy
 * @return {[object]} Returns the new planet object
 * @async
 */
const createColonyPlanet = async (user, galaxy, coordinates) => {
  if (user && galaxy && coordinates) {
    console.log("--COLONIZE PLANET");
    // Give the user a planet in the galaxy
    const planet = {
      galaxyId: galaxy._id,
      lastUpdated: new Date(),
      basicInfo: {
        owner: user._id,
        planetName: user.gameProfile.nickname + "'s Planet",
        coordinates: {
          systemIndex: coordinates.systemIndex,
          planetIndex: coordinates.planetIndex,
        },
      },
      inboundMissions: [],
      outboundMissions: [],
      resources: {
        metal: 1000,
        crystal: 1000,
        deuterium: 1000,
      },
      fleet: {
        battleCruiser: 0,
        smallCargo: 0,
        largeCargo: 0,
        recycler: 0,
        espionageProbe: 0,
      },
      buildings: {
        metalMine: 0,
        crystalMine: 0,
        deuteriumSynthesizer: 0,
        solarPlant: 0,
        fusionReactor: 0,
        metalStorage: 0,
        crystalStorage: 0,
        deuteriumTank: 0,
        shipyard: 0,
      },
    };
    console.log("New planet colonized:", planet.basicInfo.planetName);
    return planet;
  } else {
    return console.error("Error colonizing planet");
  }
};

/**
 * Determines the time it will take for a fleet to reach its target.
 * @param  {[object]} origin The origin planet object
 * @param  {[object]} target The target planet object
 * @param  {[object]} fleet The fleet object
 * @return {[object]} Returns the time in hours it will take for the fleet to reach its target
 * @async
 */
const determineTravelTime = async (origin, target, fleet, speedModifer) => {
  if (origin && target && fleet) {
    console.log("--DETERMINE TRAVEL TIME");
    console.log("Origin:", origin.basicInfo);
    console.log("Target:", target.basicInfo);
    // Determine the distance between the origin and target
    const systemDistance = Math.abs(
      target.basicInfo.coordinates.systemIndex -
        origin.basicInfo.coordinates.systemIndex
    );
    const planetDistance = Math.abs(
      target.basicInfo.coordinates.planetIndex -
        origin.basicInfo.coordinates.planetIndex
    );
    distance = systemDistance + planetDistance;
    console.log("Distance:", distance);

    // Find the slowest ship in the fleet
    let speed;
    for (const ship in fleet) {
      if (fleet[ship] > 0) {
        speed = shipData[ship].speed;
        break;
      }
    }
    if (speed === undefined) {
      return console.error("No valid ships in the fleet.");
    }

    for (const ship in fleet) {
      if (fleet[ship] > 0 && shipData[ship].speed < speed) {
        speed = shipData[ship].speed;
      }
    }

    console.log("Speed:", speed);
    // Determine the time it will take for the fleet to reach its target
    const hoursTravelTime = distance / (speed * speedModifer);
    console.log("Hours travel time:", hoursTravelTime);
    return hoursTravelTime;
  }
};

/**
 * Adjusts the resources and fleet of the origin planet based on the mission parameters.
 * @param  {[object]} origin The origin planet object
 * @param  {[object]} mission The mission object
 * @return {[object]} Returns true if the mission parameters are valid, otherwise returns an error message
 * @async
 */
const checkMissionParameters = async (origin, mission) => {
  if (origin && mission) {
    console.log("--LAUNCH FLEET");
    // Make sure the planet has enough of each ship to send on the mission
    for (const ship in mission.fleet) {
      if (origin.fleet[ship] < mission.fleet[ship]) {
        return {
          status: 400,
          message: {
            message:
              "The origin planet does not enough ships of the correct type.",
            ship: ship,
            available: origin.fleet[ship],
            requested: mission.fleet[ship],
          },
        };
      }
    }

    // Make sure the planet has enough resources to send on the mission
    for (const resource in mission.cargo) {
      if (origin.resources[resource] < mission.cargo[resource]) {
        return {
          status: 400,
          message: {
            message: "The origin planet does not have that many resources.",
            resource: resource,
            originResources: origin.resources[resource],
            requestedResources: mission.cargo[resource],
          },
        };
      }
    }

    // Make sure the total cargo capacity of the mission fleet is enough to carry the total resources
    let totalCargoCapacity = 0;
    for (const ship in mission.fleet) {
      totalCargoCapacity += shipData[ship].cargo * mission.fleet[ship];
    }
    const totalResources =
      mission.cargo.metal + mission.cargo.crystal + mission.cargo.deuterium;

    console.log("Total cargo capacity:", totalCargoCapacity);
    console.log("Cargo sent:", totalResources, " (Metal:", mission.cargo.metal, "Crystal:", mission.cargo.crystal, "Deuterium:", mission.cargo.deuterium, ")");
    if (totalCargoCapacity < totalResources) {
      return {
        status: 400,
        message: {
          message:
            "The mission fleet does not have enough cargo capacity to carry the resources.",
          totalCargoCapacity: totalCargoCapacity,
          requestedResources: totalResources,
        },
      };
    }
    console.log("Mission parameters are valid.");
    return true;
  }
};

module.exports = {
  calculateResourceProduction,
  checkBuildingResourceCost,
  checkShipResourceCost,
  createColonyPlanet,
  determineTravelTime,
  checkMissionParameters,
};
