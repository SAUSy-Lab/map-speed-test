// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements that may be used a lot
var $m; // (currently empty) map object

// A -> B lat,lon points and the average of the two
var $A = [];
var $B = [];

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
		source: new ol.source.OSM()
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

	// define A->B marker layer
	var source = new ol.source.Vector();
	source.addFeatures([A,B]);
	var markers = new ol.layer.Vector({
		source: source
	});

	// create the bloody map
	$m = new ol.Map({
		target:'map',
		layers:[basemap,markers],
		view: view,
		// no controls
		controls: []
	});
/*
	// no interactions
	interactions: []
*/
}

// function to convert lon/lat to ol point
// basically a mask for a shorter name
function lltp(lonlat){
	var lon = lonlat[0];
	var lat = lonlat[1];
	
}

// get and store the location of the cursor
function updateCursorLocation(event){
	var coords = event.coordinate;
	var lonlat = ol.proj.toLonLat(coords);
	$cursorLocation = lonlat;
};

// start tracking movement
function trackCursor(event){
	console.log('tracking cursor');
	//console.log(event.coordinate[0])
	// start sampling cursor locations
	$m.un('click',trackCursor);
	$m.on('click',closeTrack);
	$cursorTimer = setInterval(addCoordinate,$samplingRate);
}

function closeTrack(){
	clearInterval($cursorTimer);
	$m.un('click',closeTrack);
	$m.on('click',trackCursor);
	mapMatch($c)
	$c = []
}

// append cursor location to the list
function addCoordinate(){
	$c.push($cursorLocation)
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
				var f = ol.format.JSONFeature.readFeature(matchGeom);
				console.log(f);
			}
		}
	}
	r.send();
}


// project and unproject points. mask for overly long names
// lat-lon to pixel
function lToP(latLngObject){
	return $m.latLngToContainerPoint(latLngObject);
}
// pixel to lat-lon
function pToL(point){
	return $m.containerPointToLatLng(point);
}

// calculate euclidean distance from two perpendicular lengths
function euclid(a,b){
	return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
}

