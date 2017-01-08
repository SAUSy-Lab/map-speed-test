// this script is currently in a very primitive state
// it can map-match a trace more or less, but I need 
// to start storing data somewhere



// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements that may be used a lot
var $d; // document
var $b; // body element
var $m; // map object
// coordinate string
var $c = [];
// constantly updated current lat/lon of cursor on the map
var $cursorLocation;
var $cursorTimer;

// A -> B lat,lon points and the average of the two
var $A = [];
var $B = [];
var $mapCenter = [];

// initialize onload by getting some global elements, then pass the ball off
function start(){
	$d = document;
	$b = $d.getElementsByTagName('body')[0];
	makeTheMap();
}

// creates the map
function makeTheMap(){
	// select a random point set
	var i = Math.floor(Math.random() * $pointSets.length);
	$A = [$pointSets[i][0],$pointSets[i][1]];
	$B = [$pointSets[i][2],$pointSets[i][3]];
	// just the average of the two for now
	$mapCenter = [ ($A[0]+$B[0])/2, ($A[1]+$B[1])/2 ];
	// leaflet: start map at a random location
	$m = L.map('map',{
		'center': $mapCenter,
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
	// use OSM tiles for now
	L.tileLayer($tilesource).addTo($m);
	// create and then add A and B
	L.marker($A,{icon:$Aicon}).addTo($m);
	L.marker($B,{icon:$Bicon}).addTo($m);
	// add n event listener for clicks
	$m.on('click',trackCursor)
	// monitor cursor position
	$m.on('mousemove',function(e){$cursorLocation = e.latlng});
}

// start tracking finger movement
function trackCursor(event){
	// stop listening for clicks
	$m.off('click',trackCursor);
	// start sampling cursor locations
	$cursorTimer = setInterval(addCoordinate,$samplingRate);
	// listen for clicks in a different way
	$m.on('click',closeTrack);
}

function closeTrack(){
	clearInterval($cursorTimer);
	$m.off('click',closeTrack);
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
		c.push(coords[i].lng+','+coords[i].lat);
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

// calculate euclidean distance from two perpendicular lengths
function euclid(a,b){
	return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
}

