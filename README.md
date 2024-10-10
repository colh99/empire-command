# Empire Command

Empire Command is a space strategy war game played in real time, inspired primarily by Ogame. Currently, there is no frontend interface for the game, and the backend is still a work in progress. The project began as an API project for a Web Services course, but my ambition was to implement more advanced features than just simple CRUD operations.

The game centers around resource accumulation and time-based fleet tactics. Each player is given an initial **planet** on which they can construct **buildings** or **fleets**. **Buildings** produce additional **resources** or serve other purposes, while **fleets** can be used on **missions**.

## Components
- **Back-End Server**: Express.js on Node.js, deployed via Render.com
- **Database**: MongoDB
- **User Authentication**: OAuth via Auth0 (Google login)
- **Unit Testing**: Limited unit tests are implemented with Jest, more to be added

## Endpoint Documentation
You can visit https://empire-command-api.onrender.com/api-docs/ to see the documentation for each endpoint. Note that it may take 30-60 seconds for the server to spin up. 

Executing these endpoints requires being logged in. I do not have a privacy policy or terms of service defined, so for legal reasons I cannot currently support logins. Therefore, the login endpoint at https://empire-command-api.onrender.com/login is disabled. However, I hope viewing the endpoint documentation can still give you a good idea of what's possible.

## Current Features
Here is a description of the main features currently implemented:
- Users can join a galaxy (game), which provides them with a planet in that galaxy from which to operate.
- Users can change their nickname to one that is not already taken.
- Construct buildings on a planet you own.
- Certain buildings are capable of producing resources over time (Metal Mine, Crystal Mine, Deuterium Synthesizer).
- Construct fleets on a planet you own.
- Fleets (ships) can be used to launch missions, for which the user can define parameters such as the target destination, ships to be sent, and cargo to be carried from the origin planet.
- Cargo missions will deliver their cargo to the target planet.
- Users can rename their planets.
- Validation checks to make sure requests can only be made if a user is authorized. For example deleting a galaxy requires admin authorization.
- Game simulation checks to make sure any action a player takes is possible. For example they must have enough resources to construct ships.
- Multiple galaxies can be created by admins, which function as insulated games. This means missions can only interact with planets in the same galaxy.
- Galaxies have their own rule configurations which can be used to define unique game speed for that galaxy. For example, fleet travel speeds can be made faster or slower.

## Feature Demonstrations

### An important note: If a tree falls in the forest...

I wanted this project to work without spending money for server costs. There are limits that come with that, like limited uptime, and no scheduled jobs. This means I had a problem to solve: can I implement real-time features like constant resource accumulation if the server isn't always running?

My workaround was to design the project so that the specific requested information only updates on-demand. For example, timestamps must be added to planets to keep track of when they were last updated, so that the resource accumulation can be calculated according to that last update.

Since there is no frontend yet, below are a few console logs from the server which can give you an idea of how various features work.


### Updating Planet Resources

The server must use the most up-to-date information for a planet's current resources to accurately validate a user's actions, or to simply display it for the user via a GET request for the planet.

It checks the database for the last known resource amounts, then uses the amount of time passed on the server since the last update and other factors to determine how many resources to add.

```c
--UPDATE PLANET RESOURCES
Old resources:  {
  metal: 87832.46458333333,
  crystal: 82820.40894444445,
  deuterium: 92811.40366666667
}
Time difference in hours:  1.5185475
Added Metal: 759.27375 Crystal: 508.7134125 Deuterium: 303.7095
Updated resources:  {
  metal: 88591.73833333333,
  crystal: 83329.12235694446,
  deuterium: 93115.11316666666
}
```

### Constructing a Building

Upgrading a building is done through a PUT request. First, the current planet resources are calculated on the server, then if the planet has enough resources, it subtracts the cost and adds the building. After this has all been calculated, the server is updated.

```c
--UPDATE PLANET RESOURCES
...
Updated resources:  {
  metal: 403.9554166666666,
  crystal: 601.3078027777777,
  deuterium: 1000
}
--CHECK BUILDING RESOURCE COST
Building: deuteriumSynthesizer
Total cost:  { metal: 200, crystal: 250, deuterium: 50 }
Planet resources after cost:  {
  metal: 203.95541666666662,
  crystal: 351.30780277777774,
  deuterium: 950
}
```

### Launching a Cargo Mission

Sending a mission is done through a POST request. A cargo mission can be sent by selecting a valid target planet, choosing the ships by defining the fleet, and attaching resource from the planet. The server then calculates the speed of the fleet and the distance to determine travel times to and from the destination. The mission and associated planets are updated on-demand if those timestamps have occured.

```c
--DETERMINE TRAVEL TIME
Origin: {
  owner: 'google-oauth2|<userId>',
  planetName: "Emperors Planet",
  coordinates: { systemIndex: 0, planetIndex: 6 }
}
Target: {
  owner: 'google-oauth2|<different userId>',
  planetName: 'Test Planet A',
  coordinates: { systemIndex: 0, planetIndex: 8 }
}
Distance: 2
Speed: 2
Hours travel time: 0.04
Departure time: 10/2/2024, 8:45:41 PM
Arrival time: 10/2/2024, 8:48:05 PM
Return time: 10/2/2024, 8:50:29 PM
--UPDATE PLANET RESOURCES
...

--LAUNCH FLEET
Total cargo capacity: 61600
Cargo sent: 6600  (Metal: 2200 Crystal: 2200 Deuterium: 2200 )
Mission parameters are valid.
```

## Future Work
- Improve integration of resource production updates and mission updates to ensure accuracy.
- Increase test coverage
- Some buildings produce energy (Solar Plant, Fusion Reactor). Resource production buildings consume energy. If there is an energy deficit, resource production is reduced.
- Buildings and fleets should take time to build, and be added to seperate build queues.
- Planets are limited by resource storage capacities, which can be increased by upgrading storage buildings (Metal Storage, Crystal Storage, Deuterium Tank).
- Certain ships require different levels of shipyards to be built on the planet in order to construct
- Ships consume fuel (deuterium), and missions need enough to be launched.
- More mission types: raid (attack another planet and steal resources), transport (send a fleet to another planet), espionage (send an espionage probe to GET intel on another player's planet), recycle (harvest resources from a planet's atmosphere).
- Battle simulation: when a raid mission arrives, a battle should be simulated. This compares the mission fleet and the target planet fleet, and determines how many of each to destroy. If the attacker is determined to be victorious, the attacker fleet will steal resources and return.
- Ships destroyed in battle leave a debris field at a planet, which can be recovered by anyone with the recycle mission and recycler ship.
- Player inbox: Various events should be logged for the player. Particularly, fleet events should be kept for the player to view, and they should be alerted about approaching hostile fleets.
- NPC planets to be raided (and perhaps raid back!)