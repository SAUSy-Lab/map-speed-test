# map-speed-test
This web app, STILL UNDER ACTIVE DEVELOPMENT, is a touchscreen test for visual/cognitive routfinding speed and accuracy between two points on a map. 

The researcher provides a list of paired points representing origins and destinations on a street network. One of these is selected at random and presented to the user on a tiled webmap to be provided by the researcher. The user is presented with a touchscreen and their task is to trace the shortest path along the network between the two points as quickly and accurately as possible. 

The resulting freehand path is matched to the network by OSRM and stored on the server, to be compared later to the computed shortest path. There may also be a trial version of the app where the results are not stored, but shown on screen to acustom the user to the level of precision necessary for an accurate response.

The idea is that a better map, for the purposes of finding a shortest/best/lowest-cost path between two points on a network, should result in quicker and more accurate responses on average than a worse map. This project is being developed to test ways of rendering OpenStreetMap data, but the concept and software could be extended at least in theory to other applications including schematic maps and applications where the user is trying to minimize a general (non-distance) cost function.

This project currently depends on OpenLayers (running on a touchscreen computer) and OSRM running on a server with OSM data.
