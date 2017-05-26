-- table for points of origin and destination
CREATE TABLE map_speed_od (
	id serial PRIMARY KEY,
	vector geometry(LINESTRING,4326),
	shortest_path geometry(LINESTRING,4326)
);


-- table for storing results

CREATE TABLE map_speed_results (
	id serial PRIMARY KEY, 
	od_id integer, -- id of od table
	session_id numeric,
	trace geometry(LINESTRING,4326),
	load_time numeric, -- javascript time in milliseconds, time the map was revealed
	start_time numeric, -- javascript time in milliseconds, trace start
	end_time numeric, -- javascript time in milliseconds, trace end
	zoom_level real,
	map_extent geometry(POLYLINE,4326), -- line from screen minX,minY->maxX,maxY
	min_opacity real -- variable of interest, opacity of deadends, varied randomly 
);
