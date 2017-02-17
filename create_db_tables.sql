-- table for points of origin and destination
CREATE TABLE od (
	id serial PRIMARY KEY,
	vector geometry(LINE,4326)
);

/*
-- tabe for storing results
CREATE TABLE od_results (
	res_id serial, 
	od_id integer,
	
);
*/
