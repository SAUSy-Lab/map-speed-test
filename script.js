// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements that may be used a lot
var $m; // (currently empty) map object

// A -> B lat,lon points
var $A = [];
var $B = [];
// source for OD points layer
var $ODsource = new ol.source.Vector();
// source for interactive drawing layer
var $scratchSource = new ol.source.Vector();

var $load_time;	// moment the map has been revealed
var $start_time;	// moment finger touches the screen
var $end_time;		// moment finger leaves the screen
var $od_id;			// ID of OD pair presented
var $session_id = Math.random();	// ID of the user's session

// array of OD IDs that have already been returned
// initialized at non-existent value
var $completedODs = [-1];


// START button has been pressed. Do all the stuff!
function start(){
	makeFullScreen();
	// hide the button
	var button = document.getElementById('startbutton');
	button.parentNode.removeChild(button);
	// DO THE MAP
	// make a map with all the stuff except the stuff that changes per OD
	var variableLayer = new ol.layer.VectorTile({
		source: $variableTileSource,
		style: $variableStyleFunction
	});
	// make a map with all the stuff except the stuff that changes per OD
	var baseLayer = new ol.layer.VectorTile({
		source: $baseTileSource,
		style: $baseStyleFunction
	});
	$m = new ol.Map({
		target:'map',
		controls:[],
		layers:[baseLayer,variableLayer]
	});
	// place for storing scribbles
	var scratchLayer = new ol.layer.Vector({
		source: $scratchSource
	});	
	$m.addLayer(scratchLayer);
	// add A->B features to a layer so they can be included in the map
	var markers = new ol.layer.Vector({ source:$ODsource });
	$m.addLayer(markers);
	// create the DRAW interaction object
	var draw = new ol.interaction.Draw({
		source: $scratchSource,
		type: 'LineString',
		freehand: true
	});
	// add the interaction to the map
	$m.addInteraction(draw);
	// listen for the start of a draw motion and note the time
	draw.on('drawstart',function(event){
		var date = new Date();
		$start_time = date.getTime();
	});
	// listen for the end of a draw motion
	draw.on('drawend',drawend);
	// call for a new OD initialization
	newOD();
}

// function called at the end of a drawing event
function drawend(event){
	// note the time
	var date = new Date();
	$end_time = date.getTime();
	// get a copy of the feature geometry in two projections
	var geom3857 = event.feature.getGeometry().clone();
	var geom4326 = event.feature.getGeometry().clone();
	geom4326.transform('EPSG:3857','EPSG:4326');
	// if the line is too complex, simplify it
	if(geom4326.getCoordinates().length < 30){ // is simple
		mapMatch(geom4326.getCoordinates());
	}else{ // is complex
		// simplify in locally undistorted mercator projection
		var simple = geom3857.simplify( $simplificationDistance );
		// back to latlon and mapmatch
		simple.transform('EPSG:3857','EPSG:4326');
		console.log(geom4326.getCoordinates().length);
		console.log(simple.getCoordinates().length);
		mapMatch(simple.getCoordinates());
	}
	// send results to the DB
	storeResults( geom4326.getCoordinates() );
	// erase the blackboard
	$scratchSource.clear();
	// set a new grey value at random for the next rendering
	$grey = Math.ceil( Math.random() * (255-$greymin) + $greymin );
}

// request a new random OD pair from the server
// store it in the global variables
// load it into the map when ready
function newOD(){
	hideMap();
	// request points
	var r = new XMLHttpRequest();
	var URL = $randomPointsURL+'?completedODs='+$completedODs;
	r.open('get',URL,true);
	r.onreadystatechange = function(){
		if(r.readyState == 4){ // finished
			if(r.status == 200){ // got good response
				var data = JSON.parse(r.responseText);
				// make sure we do acually have a result
				if(data.id == null){
					alert("You're done! Thanks for your time!");
					return;
				}
				// store globally
				$A = [data.lon1,data.lat1];
				$B = [data.lon2,data.lat2];
				$od_id = data.id;
				$completedODs.push($od_id);
				// define features
				var A = new ol.Feature({geometry: new ol.geom.Point(ol.proj.fromLonLat($A))});
				var B = new ol.Feature({geometry: new ol.geom.Point(ol.proj.fromLonLat($B))});
				A.setStyle(Acon);
				B.setStyle(Bcon);
				// clear old features from the layer
				$ODsource.clear();
				// add the new/replacement features
				$ODsource.addFeatures([A,B]);
				// fit the screen to the new ODs
				var view = new ol.View();
				view.fit( $ODsource.getExtent(), {size: $m.getSize()} );
				$tiles_requested = $tiles_loaded = 0;
				$m.setView(view);
				// give the map 4 seconds to load and render, then show it
				setTimeout(showMap,4000);
			}
		}
	}
	r.send();
}

// hide the map from view
function hideMap(){
	var map = document.getElementById('map');
	map.setAttribute('style','visibility:hidden');
}
// return the map to view
function showMap(){
	var map = document.getElementById('map');
	map.setAttribute('style','');
	var date = new Date();
	$load_time = date.getTime();
}

// transform a string of lon-lat coords to WKT LINESTRING
function coordsToWKT(coordinates){
	var c = coordinates;
	var nc = [];
	for(i=0;i<c.length;i++){
		nc.push(c[i][0]+' '+c[i][1]);
	}
	var WKT = 'LINESTRING('+nc.join(',')+')';
	return WKT;
}

// send data to be stored on the server database
function storeResults(coords){
	var r = new XMLHttpRequest();
	// format parameters
	var params = 'od_id='+$od_id;
	params += '&session_id='+$session_id;
	params += '&load_time='+$load_time;
	params += '&start_time='+$start_time;
	params += '&end_time='+$end_time;
	params += '&zoom_level='+$m.getView().getZoom();
	params += '&trace='+coordsToWKT(coords);
	params += '&map_extent='+extentWKT();
	params += '&min_grey='+$grey;
	r.open('POST',$storePHPURL,true);
	// set headers
	r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	//r.setRequestHeader("Content-length", params.length);
	//r.setRequestHeader("Connection", "close");
	// and send
	r.send(params);
}

// get current extent as a WKT LINESTRING in 4326
function extentWKT(){
	// get the extent object
	var e = $m.getView().calculateExtent( $m.getSize() );
	// project to 4326
	e = coords2latlon([   [ e[0],e[1] ], [ e[2],e[3] ]   ]);
	// format as WKT
	return 'LINESTRING('+e[0][0]+' '+e[0][1]+','+e[1][0]+' '+e[1][1]+')';
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
	var radius = fingerRadius();
	// make list into pairs of coordinate strings
	var c = [];
	var radii = [];
	for(i=0;i<coords.length;i++){
		c.push(coords[i][0]+','+coords[i][1]);
		radii.push(radius);
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
				var data = JSON.parse(r.responseText);
				var match1 = data.matchings[0];
				// render match geometry
				var format = new ol.format.GeoJSON();
				var feature = format.readFeatures(
					match1.geometry,
					{
						dataProjection: 'EPSG:4326',
						featureProjection: 'EPSG:3857'
					}
				)[0];
				feature.setStyle(
					new ol.style.Style({
						stroke: new ol.style.Stroke({
							width:5,
							color:'#ff0000'
						})
					})
				);
				$scratchSource.addFeature(feature);
				// prepare a new map after the match has 
				// been shown for a few seconds
				setTimeout(newOD,3000);
			}
		}
	}
	r.send();
}

// returns the rough radius of a fingertip
// in meters based on the current map scale
function fingerRadius(){
	// TODO finish this function
	return 50;
}

function makeFullScreen(){
	var de = document.documentElement;
	// make the page full screen (lots of campatibility BS)
	if(de.requestFullscreen) {
		de.requestFullscreen();
	} else if(de.mozRequestFullScreen) {
		de.mozRequestFullScreen();
	} else if(de.webkitRequestFullscreen) {
		de.webkitRequestFullscreen();
	} else if(de.msRequestFullscreen) {
		de.msRequestFullscreen();
	}
}
