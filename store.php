<?php
#quickly return json containing randomly selected OD points from server-side DB

require 'config.php';

# connect to DB
$connection = pg_connect($DBconnectionString);

# get the GET variables. We know what to expect, so 
# there is little checking needed
$od_id		=	pg_escape_literal($_GET['od_id']);
$session_id	=	pg_escape_literal($_GET['session_id']);
$load_time	=	pg_escape_literal($_GET['load_time']);
$start_time =	pg_escape_literal($_GET['start_time']);
$end_time	=	pg_escape_literal($_GET['end_time']);
$zoom_level	=	pg_escape_literal($_GET['zoom_level']);
$trace		=	pg_escape_string($_GET['trace']);
$map_extent	=	pg_escape_string($_GET['map_extent']);
$min_grey	=	pg_escape_string($_GET['min_grey']);

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
			min_grey
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
			$min_grey
		);
";
$result = pg_query($connection,$query);



# format it to JSON and send
#echo json_encode($record,JSON_NUMERIC_CHECK);

# close the connection
pg_close($connection);

?>
