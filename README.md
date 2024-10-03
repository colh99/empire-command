# Empire Command

Empire Command is a space strategy game.

## Components
- Backend Server via Render.com
- Database via MongoDB
- OAuth user authentication via Auth0

## Feature Demonstrations

### Constructing a Building

```c
--UPDATE PLANET RESOURCES
Old resources:  { metal: 402.0034722222222, crystal: 600, deuterium: 1000 }
Time difference in hours:  0.003903888888888889
Added Metal: 1.9519444444444445 Crystal: 1.3078027777777779 Deuterium: 0
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

```c
--DETERMINE TRAVEL TIME
Origin: {
  owner: 'google-oauth2|<userId>',
  planetName: "Emperor's Planet",
  coordinates: { systemIndex: 0, planetIndex: 6 }
}
Target: {
  owner: 'google-oauth2|<userId>',
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
Old resources:  {
  metal: 90003.95541666666,
  crystal: 85001.30780277778,
  deuterium: 95000
}
Time difference in hours:  0.05701833333333333
Added Metal: 28.509166666666665 Crystal: 19.101141666666667 Deuterium: 11.403666666666666
Updated resources:  {
  metal: 90032.46458333333,
  crystal: 85020.40894444445,
  deuterium: 95011.40366666667
}
--LAUNCH FLEET
Total cargo capacity: 61600
Cargo sent: 6600  (Metal: 2200 Crystal: 2200 Deuterium: 2200 )
Mission parameters are valid.
```