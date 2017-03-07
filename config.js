// script will hold user-specific information like server location, DB access credentials, etc

// tile layer source, formatted for ol.source.XYZ
var $tileURL = 'https://a.tiles.mapbox.com/v4/bike756.838mwyhs/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYmlrZTc1NiIsImEiOiI5Y3p6aTZFIn0.fWDYyONWAQgrHQbdrFMbfA'

// OSRM server address 
var $OSRMserver = 'http://206.167.182.17:5000'

var $storePHPURL = 'http://206.167.182.17/~ubuntu/store.php'

var $randomPointsURL = 'http://206.167.182.17/~ubuntu/random_points.php';

// line simplification parameter
var $simplificationDistance = 6; // mercator 'meters'

// grey for deadends, from 0 black to 255 white
// int please, and > 16
var $greymin = 80;

var $grey = Math.ceil( Math.random() * (255-$greymin) + $greymin );

// define basemap layer SOURCE, 
// (currently vector tiles being served from mapbox)
var $baseTileSource = new ol.source.VectorTile({
	url: $tileURL,
	tileGrid: ol.tilegrid.createXYZ({maxZoom: 20}),
	format: new ol.format.MVT(),
	tilePixelRatio: 16
})


// style function for rendering linear features based on attributes
function stylefunction(feature){
	// get properties fo the feature
	var p = feature.getProperties();
	// condition for non-rendering
	if( p.car_comp == undefined ){
		return null;
	}
	// default white
	var color = '#ffffff';
	// vary color by property
	if( p.car_comp == -1 ){ // is deadend
		var g = $grey.toString(16);
		color = '#'+g+g+g;
	}
	if(p.car_direct != undefined){ // has directness value
		if( p.car_direct < 1 ){ // is not direct
			// define how much range we have
			var range = 255 - $grey;
			// vary value by value
			var greyval = Math.floor(p.car_direct * range) + $grey;
			g = greyval.toString(16);
			color = '#'+g+g+g;
		}
	}
	// create style object to return
	var style = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: 2
		})
	});
	return [style];
}


// Icon settings for Origin and Destination

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
