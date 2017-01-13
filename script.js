// this script is currently in a very primitive state
// it can map-match a trace more or less, but I need 
// to start storing data somewhere



// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements that may be used a lot
var $d; // document
var $m; // map object
// coordinate string
var $c = [];
// constantly updated current lat/lon of cursor on the map
var $cursorLocation = [];
var $cursorTimer;

// A -> B lat,lon points and the average of the two
var $A = [];
var $B = [];
var $mapCenter = [];

// initialize onload by getting some global elements, then pass the ball off
function start(){
	$d = document;
	makeTheMap();
}

// creates the map
function makeTheMap(){
	// select a random point set
	var i = Math.floor(Math.random() * $pointSets.length);
	$A = [$pointSets[i][0],$pointSets[i][1]];
	$B = [$pointSets[i][2],$pointSets[i][3]];
	// just the average of the two for now
	$mapCenter = [ ($A[1]+$B[1])/2, ($A[0]+$B[0])/2 ];
	// leaflet: start map at a random location

	$m = new ol.Map(
		{
			target: 'map',
			layers: [
				new ol.layer.Tile({ source: new ol.source.OSM() })
			],
			view: new ol.View(
				{
					center: ol.proj.fromLonLat($mapCenter),
					zoom: 15
				}
			),
			// no controls
			controls: [],
			// no interactions
			interactions: []
		}
	);

//	$m = L.map('map',{
//		'center': $mapCenter,
//		'zoom': 17,
//		'zoomControl': false,
//		'attributionControl':false,
//		'animate':true
//	});
//	// disable all map movement
//	$m.dragging.disable();
//	$m.touchZoom.disable();
//	$m.doubleClickZoom.disable();
//	$m.scrollWheelZoom.disable();
//	$m.keyboard.disable();
//	// use OSM tiles for now
//	L.tileLayer($tilesource).addTo($m);
//	// create and then add A and B
//	L.marker($A,{icon:$Aicon}).addTo($m);
//	L.marker($B,{icon:$Bicon}).addTo($m);
//	// add one-time event listeners for user interaction
//	// TODO these are not working
//	$m.on('touchstart',trackCursor);
//	$m.on('touchend',closeTrack);
//	$m.on('touchmove',function(e){$cursorLocation = e.latlng});
//	// for mouse...
	$m.on('click',trackCursor);
	// monitor cursor position
	$m.on('pointermove',updateCursorLocation);
}

// get and store the location of the cursor
function updateCursorLocation(event){
	var coords = event.coordinate;
	var lonlat = ol.proj.toLonLat(coords);
	$cursorLocation = lonlat;
};

// start tracking movement
function trackCursor(event){
	console.log('tracking cursor')
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

