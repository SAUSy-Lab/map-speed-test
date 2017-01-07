// script will hold user-specific information like server location, DB access credentials, etc

// tile layer source
$tilesource = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

// OSRM server address 
// this should probably be your own server
$OSRMserver = 'http://206.167.182.17:5000'

// select a random center point for the map
// user-defined function. Should return 
// latitude,longitude values
// easiest to just change bounding values of this function
function randomCenter(){
	latmax = 39.27
	latmin = 39.0269
	lonmax = -84.3716
	lonmin = -84.6874
	lonrange = lonmax - lonmin
	latrange = latmax - latmin
	lat = latmin + Math.random() * latrange / 1;
	lon = lonmin + Math.random() * lonrange / 1;
	return [lat,lon];
}

// Graphic SETTINGS

// symbol for starting location
var $Aicon = L.icon({
	'iconUrl':'icons/A.svg',
	'iconAnchor':[20,35]
});
// symbol for destination location
$Bicon = L.icon({
	'iconUrl':'icons/B.svg',
	'iconAnchor':[20,35]
});
