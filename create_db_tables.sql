-- table for points of origin and destination
CREATE TABLE map_speed_od (
	id serial PRIMARY KEY,
	vector geometry(LINESTRING,4326)
);


-- table for storing results
CREATE TABLE map_speed_results (
	id serial PRIMARY KEY, 
	od_id integer, -- id of od table
	trace geometry(LINESTRING,4326),
	display_time numeric, -- javascript time in milliseconds, time the map was revealed
	start_time numeric, -- javascript time in milliseconds
	end_time numeric, -- javascript time in milliseconds
	zoom_level real,
	map_extent geometry(POLYGON,4326) -- bounding box of map
);
