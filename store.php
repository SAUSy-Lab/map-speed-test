<?php
#quickly return json containing randomly selected OD points from server-side DB

require 'config.php';

# connect to DB
$connection = pg_connect($DBconnectionString);

# get the GET variables. We know what to expect, so 
# there is little checking needed
$od_id		=	pg_escape_literal($_GET['od_id']);
$start_time =	pg_escape_literal($_GET['start_time']);
$end_time	=	pg_escape_literal($_GET['end_time']);
$zoom_level	=	pg_escape_literal($_GET['zoom_level']);
$trace		=	pg_escape_string($_GET['trace']);

# select a random row
$query = "
	INSERT INTO map_speed_results 
		( 
			od_id,
			trace,
			start_time, 
			end_time,
			zoom_level
		) 
		VALUES 
		( 
			$od_id,
			ST_GeomFromText('$trace',4326),
			$start_time, 
			$end_time,
			$zoom_level
		);
";
$result = pg_query($connection,$query);



# format it to JSON and send
#echo json_encode($record,JSON_NUMERIC_CHECK);

# close the connection
pg_close($connection);

?>
