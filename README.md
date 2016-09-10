# map-speed-test
This web app is a touchscreen test for visual/cognitive routfinding speed and/or accuracy between two points on a map. Inside a bounding box of interest, it picks a random location and loads a map with two semi-randomly located points placed on a street network. The user's/subject's task is to trace the shortest path between the two points as fast as possible. The resulting path is matched to the map data then stored, to be compared later to the computed shortest path. There is also a trial version of the app where the results are not stored, but shown on screen to acustom the user to the level of precision necessary for an accurate response.

The idea is that a good map, for the purposes of finding a shortest/best/lowest-cost path between two points on a network, should result in quicker and more accurate responses on average. This project is being developed to test ways of rendering OpenStreetMap data, but the concept and software could be extended at least in theory to other applications including schematic maps and applications where the user is trying to minimize a general (non-distance) cost function.

Depends on Leaflet, OSRM.
