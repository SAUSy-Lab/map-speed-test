// script will hold user-specific information like server location, DB access credentials, etc

// tile layer source
var $tilesource = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

// OSRM server address 
// this should probably be your own server
var $OSRMserver = 'http://206.167.182.17:5000'

// cursor location sampling rate in milliseconds
var $samplingRate = 100

var $pointSets = [
	// latA, lonA, latB, lonB
	[39.13405,-84.50706,39.12886,-84.50173],
	[39.11006,-84.51848,39.10777,-84.51123]
];

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
