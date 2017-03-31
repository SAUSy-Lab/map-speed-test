// script will hold user-specific information like server location, DB access credentials, etc

// OSRM server address 
var $OSRMserver = 'http://206.167.182.17:5000'

var $storePHPURL = 'http://206.167.182.17/~ubuntu/store.php'

var $randomPointsURL = 'http://206.167.182.17/~ubuntu/random_points.php';

// line simplification parameters
var $simplificationDistance = 5; // meters

// grey for deadends, from 0 black to 255 white
// int please, and > 16
var $greymin = 70;

var $grey = Math.ceil( Math.random() * (255-$greymin) + $greymin );

// define basemap layer SOURCE,
// tile layer source, formatted for ol.source.XYZ 
// (currently vector tiles being served from mapbox)
var $variableTileSource = new ol.source.VectorTile({
	url: 'https://a.tiles.mapbox.com/v4/bike756.838mwyhs/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYmlrZTc1NiIsImEiOiI5Y3p6aTZFIn0.fWDYyONWAQgrHQbdrFMbfA',
	tileGrid: ol.tilegrid.createXYZ({maxZoom: 20}),
	format: new ol.format.MVT(),
	tilePixelRatio: 16
})

var $baseTileSource = new ol.source.VectorTile({
	url: 'https://a.tiles.mapbox.com/v4/bike756.6iltan99/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYmlrZTc1NiIsImEiOiI5Y3p6aTZFIn0.fWDYyONWAQgrHQbdrFMbfA',
	tileGrid: ol.tilegrid.createXYZ({maxZoom: 20}),
	format: new ol.format.MVT(),
	tilePixelRatio: 16
})

// style function for rendering linear features based on attributes
function $variableStyleFunction(feature){
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

// style function for rendering polygon features based on attributes
function $baseStyleFunction(feature){
	// get properties fo the feature
	var p = feature.getProperties();
	if( p.natural == 'wood' ){
		var color = '#061702';
	}else if( p.natural == 'water' ){
		var color = '#050f42';
	}else if( p.building == 'yes' ){
		var color = '#30041c';
	}else{
		return null;
	}
	// create style object to return
	var style = new ol.style.Style({
		fill: new ol.style.Fill({ 'color': color })
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
