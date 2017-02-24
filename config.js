// script will hold user-specific information like server location, DB access credentials, etc

// tile layer source, formatted for ol.source.XYZ
var $tileURL = 'https://a.tiles.mapbox.com/v4/bike756.838mwyhs/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYmlrZTc1NiIsImEiOiI5Y3p6aTZFIn0.fWDYyONWAQgrHQbdrFMbfA'

// OSRM server address 
var $OSRMserver = 'http://206.167.182.17:5000'

var $storePHPURL = 'http://206.167.182.17/~ubuntu/store.php'

var $randomPointsURL = 'http://206.167.182.17/~ubuntu/random_points.php';

// grey for deadends, from 0 black to 255 white
// int please, and > 16
var $greymin = 80

// Graphic SETTINGS

var Acon = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [0.5,0.5],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: 'icons/A.svg'
	})
});
var Bcon = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [0.5,0.5],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: 'icons/B.svg'
	})
});
