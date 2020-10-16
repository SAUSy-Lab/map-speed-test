<?php
require 'config.php';

# connect to DB
$connection = pg_connect($DBconnectionString);

# get the GET variables. We know what to expect, so 
# there is little checking needed
$od_id		=	pg_escape_literal($_POST['od_id']);
$session_id	=	pg_escape_literal($_POST['session_id']);
$load_time	=	pg_escape_literal($_POST['load_time']);
$start_time =	pg_escape_literal($_POST['start_time']);
$end_time	=	pg_escape_literal($_POST['end_time']);
$zoom_level	=	pg_escape_literal($_POST['zoom_level']);
$trace		=	pg_escape_string($_POST['trace']);
$map_extent	=	pg_escape_string($_POST['map_extent']);
$min_opacity	=	pg_escape_string($_POST['min_opacity']);

# select a random row
$query = "
	INSERT INTO map_speed_results 
		( 
			od_id,
			session_id,
			trace,
			map_extent,
			load_time,
			start_time, 
			end_time,
			zoom_level,
			min_opacity
		) 
		VALUES 
		( 
			$od_id,
			$session_id,
			ST_GeomFromText('$trace',4326),
			ST_GeomFromText('$map_extent',4326),
			$load_time,
			$start_time, 
			$end_time,
			$zoom_level,
			$min_opacity
		);
";
$result = pg_query($connection,$query);

# close the connection
pg_close($connection);

?>
