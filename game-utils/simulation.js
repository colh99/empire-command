const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;
const buildingStats = require("../game-utils/game-rules/buildings");


const updatePlanetResources = async (planet, galaxy) => {
    if (planet && galaxy) {
        // Calculate the time difference
        const currentTime = new Date();
        const timeDifference = (currentTime - planet.lastUpdated) / 1000;
        const timeDifferenceInHours = timeDifference / 3600;

        // Calculate the new resources based on the time difference. Use the buildingStats object to get the resource production rates, multiplied by the number of buildings of that type on the planet.
        const galaxyMiningSpeedModifier = galaxy.rulesConfig.MINING_SPEED * galaxy.rulesConfig.GAME_OVERALL_SPEED;

        addedMetal = (buildingStats.metalMine.output * planet.buildings.metalMine) * timeDifferenceInHours * galaxyMiningSpeedModifier;
        addedCrystal = (buildingStats.crystalMine.output * planet.buildings.crystalMine) * timeDifferenceInHours * galaxyMiningSpeedModifier;
        addedDeuterium = (buildingStats.deuteriumSynthesizer.output * planet.buildings.deuteriumSynthesizer) * timeDifferenceInHours * galaxyMiningSpeedModifier;
        
        const updatedResources = {
            metal: planet.resources.metal + addedMetal,
            crystal: planet.resources.crystal + addedCrystal,
            deuterium: planet.resources.deuterium + addedDeuterium,
        };

        console.log("Old resources: ", planet.resources)
        console.log("Time difference in hours: ", timeDifferenceInHours)
        console.log("Added Metal:", addedMetal, "Crystal:", addedCrystal, "Deuterium:", addedDeuterium)
        console.log("Updated resources: ", updatedResources)

        // Update the planet
        await mongodb
            .getDb()
            .db("empire-command")
            .collection("planets")
            .updateOne({ _id: planet._id }, { $set: { resources: updatedResources, lastUpdated: currentTime } });

        // Return the updated planet
        return {
            ...planet,
            resources: updatedResources,
            lastUpdated: currentTime,
        };
    }
};

module.exports = { updatePlanetResources };
