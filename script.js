// variables prefixed with $ are global
// all others are local to their functions, or should be

// abreviated document elements that may be used a lot
var $m; // (currently empty) map object

// A -> B lat,lon points
var $A = [];
var $B = [];

var $start; // moment finger touches the screen
var $end;	// moment finger leaves the screen
var $od_id;	// ID of OD pair presented
var $zoom;	// displayed zoom level

// initialize onload by getting some global elements, then pass the ball off
function init(){
	// request points
	var r = new XMLHttpRequest();
	r.open('get',$randomPointsURL,true);
	r.onreadystatechange = function(){
		if(r.readyState == 4){ // finished
			if(r.status == 200){ // got good response
				var data = JSON.parse(r.responseText);
				$A = [data.lon1,data.lat1];
				$B = [data.lon2,data.lat2];
				console.log(data);
				// put the points to use
				make_the_map();
				// record the ID of the apir
				$od_id = data.id;
			}
		}
	}
	r.send();
}

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
		var g = $greymin.toString(16);
		color = '#'+g+g+g;
	}
	if(p.car_direct != undefined){ // has directness value
		if( p.car_direct < 1 ){ // is not direct
			// define how much range we have
			var range = 255 - $greymin;
			// vary value by value
			var greyval = Math.floor(p.car_direct * range) + $greymin;
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

// make the map and all that, after the points are chosen
function make_the_map(){
	// create the map
	$m = new ol.Map({
		target:'map',
		// no controls
		controls: []
	});
	// define basemap layer, which is currently 
	// vector tiles being served by mapbox
	var basemap = new ol.layer.VectorTile({
		source: new ol.source.VectorTile({
			url: $tileURL,
			tileGrid: ol.tilegrid.createXYZ({maxZoom: 20}),
			format: new ol.format.MVT(),
			tilePixelRatio: 16
		}),
		style: stylefunction
	});
	$m.addLayer(basemap);

	// define features for starting and ending points
	// these will bee added to a source and then a layer
	// the source will help us find the extent for the map
	var A = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat($A)),
		label: 'starting point'
	});
	A.setStyle(Acon);

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
	$m.addLayer(markers);

	// define map view
	var view = new ol.View();
	view.fit(
		source.getExtent(),
		{size: $m.getSize()}
	);
	$m.setView(view);
	// note the zoom level
	$zoom = view.getZoom();

	// place for storing scribbles
	var scratch = new ol.source.Vector();
	var scratchLayer = new ol.layer.Vector({
		source: scratch 
	});	
	$m.addLayer(scratchLayer);



	// interaction object	
	var draw = new ol.interaction.Draw({
		source: scratch,
		type: 'LineString',
		freehand: true
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
		$end = date.getTime();
		// get the geometry
		var feature = event.feature;
		var geometry = feature.getGeometry();
		var coordinates = geometry.getCoordinates();
		// transform to lat-lons
		coordinates = coords2latlon(coordinates);
		// send to the map-matching server
		mapMatch(coordinates);
		// send to DB
		storeResults(coordinates);
	});
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
	var URL = $storePHPURL+'?';
	URL += 'od_id='+$od_id;
	URL += '&start_time='+$start;
	URL += '&end_time='+$end;
	URL += '&zoom_level='+$zoom;
	URL += '&trace='+coordsToWKT(coords);
	r.open('get',URL,true);
	r.send();
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
				// TODO render match geometry
//				var source = ol.source.GeoJSON({
//					feature: matchGeom,
//					projection: 'EPSG:4326'
//				});
//				var layer = ol.layer.Vector({
//					source: source
//				});
//				$m.addLayer(layer);
			}
		}
	}
	r.send();
}

