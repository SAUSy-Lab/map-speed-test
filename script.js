// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements that may be used a lot
var $m; // (currently empty) map object

// A -> B lat,lon points and the average of the two
var $A = [];
var $B = [];

// drawing start and end times
var $start;
var $end;

// initialize onload by getting some global elements, then pass the ball off
function init(){
	// select a random point set
	var i = Math.floor(Math.random() * $pointSets.length);
	// order is lon, lat
	$A = [$pointSets[i][1],$pointSets[i][0]];
	$B = [$pointSets[i][3],$pointSets[i][2]];
	// just the average of the two for now
	var center = [ ($A[0]+$B[0])/2, ($A[1]+$B[1])/2 ];
	// start map at a random location

	// define map view
	var view = new ol.View({
		center: ol.proj.fromLonLat(center),
		zoom: 16
	});
	// define basemap layer, OSM for now
	var basemap = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: 'https://api.mapbox.com/styles/v1/bike756/ciza5is0x005e2rnqjppkh10x/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmlrZTc1NiIsImEiOiI5Y3p6aTZFIn0.fWDYyONWAQgrHQbdrFMbfA'
		})

		//source: new ol.source.OSM()
	});
	// define feature for starting point
	var A = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat($A)),
		label: 'starting point'
	});
	A.setStyle(Acon);
	// define feature for ending point
	var B = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat($B)),
		label: 'destination'
	});
	B.setStyle(Bcon);
	// add A->B features to a layer so they can be included in the map
	var source = new ol.source.Vector();
	source.addFeatures([A,B]);
	var markers = new ol.layer.Vector({
		source: source
	});

	// place for storing scribbles
	var scratch = new ol.source.Vector();
	var scratchLayer = new ol.layer.Vector({
		source: scratch 
	});	

	// interaction object	
	var draw = new ol.interaction.Draw({
		source: scratch,
		type: 'LineString',
		freehand: true
	});

	// create the map
	$m = new ol.Map({
		target:'map',
		layers:[basemap,markers,scratchLayer],
		view: view,
		// no controls
		controls: []
	});
	// add the interaction to the map once created
	$m.addInteraction(draw);

	// listen for the start of a draw motion
	draw.once('drawstart',function(event){
		// note the time
		var date = new Date();
		$start = date.getTime();
	});

	// listen for the end of a draw motion
	draw.once('drawend',function(event){
		// note the time the motion ended
		var date = new Date();
		$start = date.getTime();
		// get the geometry
		var feature = event.feature;
		var geometry = feature.getGeometry();
		var coordinates = geometry.getCoordinates();
		// transform to lat-lons
		coordinates = coords2latlon(coordinates);
		// send to the server
		mapMatch(coordinates);
	});
}

// project linestring to EPSG:4326 [lon,lat]
function coords2latlon(coords){
	var newcoords = [];
	for(i=0;i<coords.length;i++){
		newcoords.push(
			ol.proj.toLonLat(coords[i])
		);
	}
	return newcoords;
}

// send the coordinates to be matched on the cloud
function mapMatch(coords){
	// make list into pairs of coordinate strings
	var c = [];
	var radii = [];
	for(i=0;i<coords.length;i++){
		c.push(coords[i][0]+','+coords[i][1]);
		radii.push(30);
	}
	var r = new XMLHttpRequest();
	URL = $OSRMserver + '/match/v1/transit/';
	URL += c.join(';');
	URL += '?geometries=geojson&overview=full';
	URL += '&radiuses='+radii.join(';');
	r.open('get',URL,true);
	r.onreadystatechange = function(){
		if(r.readyState == 4){ // finished
			if(r.status == 200){ // got good response
				console.log('match returned');
				var data = JSON.parse(r.responseText);
				var matchGeom = data.matchings[0].geometry;
			}
		}
	}
	r.send();
}

