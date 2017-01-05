// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements
var $d; // document
var $b; // body element
// global map layers
var $m; // map object
// coordinate string
var $c = [];

// Graphic SETTINGS
// icon definitions for selected and unselected stops
// easiest just to define them once and reference
var $redIcon;
var $blueIcon;

// initialize onload by getting some global elements, then pass the ball off
function start(){
	$d = document;
	$b = $d.getElementsByTagName('body')[0];
	defineIcons();
	makeTheMap();
}

// creates the map
function makeTheMap(){
	// leaflet: start map
	$m = L.map('map',{
		'center': randomCenter(),
		'zoom': 16,
		'zoomControl': false,
		'attributionControl':false,
		'animate':true
	});
	// disable all map movement
	$m.dragging.disable();
	$m.touchZoom.disable();
	$m.doubleClickZoom.disable();
	$m.scrollWheelZoom.disable();
	$m.keyboard.disable();
	// OSM tiles for now
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo($m);
	$m.on('click',trackCursor)
}

// start tracking finger movement
function trackCursor(event){
	// stop listening for clicks
	$m.off('click',trackCursor);
	// listen for mouse movement
	$m.on('mousemove',addCoordinate);
	// listen for clicks in a different way
	$m.on('click',closeTrack);
}

function closeTrack(){
	$m.off('mousemove',addCoordinate);
	$m.off('click',closeTrack);
	$m.on('click',trackCursor);
	mapMatch($c)
	$c = []
}

// append this event's coordinate object to the list
function addCoordinate(event){
	if(Math.random() > 0.9){
		$c.push(event.latlng)
	}
}

// select a random center point inside some constraints
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

// send the coordinates to be matched on the cloud
function mapMatch(coords){
	// make list into pairs of coordinate strings
	var c = [];
	var radii = [];
	for(i=0;i<coords.length;i++){
		c.push(coords[i].lng+','+coords[i].lat);
		radii.push(30);
	}
	var r = new XMLHttpRequest();
	URL = 'http://206.167.182.17:5000/match/v1/transit/';
	URL += c.join(';');
	URL += '?geometries=geojson&overview=full';
	URL += '&radiuses='+radii.join(';');
	r.open('get',URL,true);
	r.onreadystatechange = function(){
		if(r.readyState == 4){ // finished
			if(r.status == 200){ // got good response
				console.log('match returned');
				var data = JSON.parse(r.responseText);
				var matchGeom = data.matchings[0].geometry
				L.geoJson(matchGeom).addTo($m)
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

// define two global icons
function defineIcons(){
	$blueIcon = L.icon({
		'iconUrl':'markers/blue-marker.svg',
		'iconAnchor':[20,35]
	});
	$redIcon = L.icon({
		'iconUrl':'markers/red-marker.svg',
		'iconAnchor':[20,35]
	});
}

// calculate euclidean distance from two perpendicular lengths
function euclid(a,b){
	return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
}

