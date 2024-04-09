const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const buildingData = require("../game-utils/game-rules/buildings");

/**
 * Updates the resources of a planet based on the time difference since the last update.
 * @param  {[object]} planet Planet object to update
 * @param  {[object]} galaxy Galaxy object to get the game rules from
 * @return {[object]}       Returns the updated planet object
 * @async
 */
const updatePlanetResources = async (planet, galaxy) => {
  if (planet && galaxy) {
    // Calculate the time difference
    const currentTime = new Date();
    const timeDifference = (currentTime - planet.lastUpdated) / 1000;
    const timeDifferenceInHours = timeDifference / 3600;

    // Calculate the new resources based on the time difference. Use the buildingData object to get the resource production rates, multiplied by the number of buildings of that type on the planet.
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

    // Update the planet
    await mongodb
      .getDb()
      .db("empire-command")
      .collection("planets")
      .updateOne(
        { _id: planet._id },
        { $set: { resources: updatedResources, lastUpdated: currentTime } }
      );

    // Return the updated planet
    return {
      ...planet,
      resources: updatedResources,
      lastUpdated: currentTime,
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

    console.log("--CHECK BUILDING RESOURCE COST")
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
      return false;
    }
  }
};

module.exports = {
  updatePlanetResources,
  checkBuildingResourceCost,
};
