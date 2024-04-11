const { checkBuildingResourceCost, checkShipResourceCost, } = require("../game-utils/simulation");
const buildingData = require("../game-utils//game-rules/buildings");
const fleetData = require("../game-utils/game-rules/ships");

// Hide console.log when running tests
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
});


describe("checkBuildingResourceCost", () => {
  it("should return total cost if planet has enough resources", async () => {
    const planet = {
      resources: {
        metal: 1000,
        crystal: 1000,
        deuterium: 1000,
      },
    };
    const building = "metalMine";

    const result = await checkBuildingResourceCost(planet, building);

    expect(result).toEqual({
      metal: buildingData[building].cost.metal,
      crystal: buildingData[building].cost.crystal,
      deuterium: buildingData[building].cost.deuterium,
    });
  });

  it("should return false if planet does not have enough resources", async () => {
    const planet = {
      resources: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
      },
    };
    const building = "metalMine";

    const result = await checkBuildingResourceCost(planet, building);

    expect(result).toBe(false);
  });
});


describe("checkShipResourceCost", () => {
  it("should return total cost if planet has enough resources", async () => {
    const planet = {
      resources: {
        metal: 5000,
        crystal: 5000,
        deuterium: 3000,
      },
    };
    const ship = {
      type: "battleCruiser",
      quantity: 1,
    };

    const result = await checkShipResourceCost(planet, ship);

    expect(result).toEqual({
      metal: fleetData[ship.type].cost.metal,
      crystal: fleetData[ship.type].cost.crystal,
      deuterium: fleetData[ship.type].cost.deuterium,
    });
  });

  it("should return total cost if planet has enough resources for multiple ships", async () => {
    const planet = {
      resources: {
        metal: 12000,
        crystal: 6000,
        deuterium: 5000,
      },
    };
    const ship = {
      type: "battleCruiser",
      quantity: 3,
    };

    const result = await checkShipResourceCost(planet, ship);

    expect(result).toEqual({
      metal: fleetData[ship.type].cost.metal * ship.quantity,
      crystal: fleetData[ship.type].cost.crystal * ship.quantity,
      deuterium: fleetData[ship.type].cost.deuterium * ship.quantity,
    });
  });

  it("should return false if planet does not have enough resources", async () => {
    const planet = {
      resources: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
      },
    };
    const ship = {
      type: "battleCruiser",
      quantity: 1,
    };

    const result = await checkShipResourceCost(planet, ship);

    expect(result).toBe(false);
  });
});
