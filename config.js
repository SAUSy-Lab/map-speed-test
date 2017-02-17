// script will hold user-specific information like server location, DB access credentials, etc

// tile layer source, formatted for ol.source.XYZ
var $tileURL = 'https://api.mapbox.com/styles/v1/bike756/ciza5is0x005e2rnqjppkh10x/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmlrZTc1NiIsImEiOiI5Y3p6aTZFIn0.fWDYyONWAQgrHQbdrFMbfA'

// OSRM server address 
var $OSRMserver = 'http://206.167.182.17:5000'

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
