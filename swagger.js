const { ObjectId } = require("mongodb");

const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Empire Command API",
    description: "API for Empire Command, a space strategy game.",
    version: "0.0.1",
  },
  //host: '',
  host: "localhost:3000",
  schemes: ["https", "http"],

  tags: [
    {
      name: "Galaxies",
      description:
        "A game takes place in a single galaxy. The galaxy is used to store game rules and find systems and planets.",
    },
    {
      name: "Planets",
      description:
        "Planets keep track of their resources, the buildings on them, and the ships in orbit. They can be owned by users.",
    },
    {
      name: "Missions",
      description:
        "Missions are fleet actions that can be created by users to command their ships.",
    },
    {
      name: "Users",
      description: "Users are the players of the game.",
    },
  ],

  definitions: {
    Coordinates: {
      galaxyNumber: 1,
      system: 2,
      orbit: 3,
    },
    Resources: {
      metal: 1000,
      crystal: 1000,
      deuterium: 1000,
    },
    Fleet: {
      battleCruiser: 0,
      smallCargo: 0,
      largeCargo: 0,
      recycler: 0,
      espionageProbe: 0,
    },
    Buildings: {
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
    Planet: {
      basicInfo: {
        owner: "ObjectId",
        planetName: "Unnamed Planet",
        coordinates: { $ref: "#/definitions/Coordinates" },
      },
      fleet: { $ref: "#/definitions/Fleet" },
      resources: { $ref: "#/definitions/Resources" },
      buildings: { $ref: "#/definitions/Buildings" },
    },
    Mission: {
      commandingUser: "ObjectId",
      originPlanet: "ObjectId",
      targetPlanet: "ObjectId",
      departureTime: Date,
      arrivalTime: Date,
      returnTime: Date,
      active: true,
      status: "en route",
      missionType: "raid",
      fleet: { $ref: "#/definitions/Fleet" },
      cargo: { $ref: "#/definitions/Resources" },
    },
    System: {
      systemNumber: 1,
      orbits: ["ObjectId"],
    },
    Rules: {
      GAME_OVERALL_SPEED: 1,
      TRAVEL_SPEED: 1,
      MINING_SPEED: 1,
      BUILDING_SPEED: 1,
    },
    Galaxy: {
      galaxyNumber: 1,
      galaxyName: "Unnamed Galaxy",
      rulesConfig: { $ref: "#/definitions/Rules" },
      systems: ["ObjectId"],
      users: ["ObjectId"],
    },
    User: {
      username: "User123",
      ownedPlanets: ["ObjectId"],
    },
  },
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/index.js"];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
