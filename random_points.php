<?php
#quickly return json containing randomly selected OD points from server-side DB

require 'config.php';

# connect to DB
$connection = pg_connect($DBconnectionString);

$completedODs = pg_escape_string($_GET['completedODs']);

# select a random row
$query = "
	SELECT 
		id,
		ST_X(ST_StartPoint(vector)) AS lon1,
		ST_Y(ST_StartPoint(vector)) AS lat1,
		ST_X(ST_EndPoint(vector)) AS lon2,
		ST_Y(ST_EndPoint(vector)) AS lat2
	FROM map_speed_od 
	WHERE id NOT IN ($completedODs)
	ORDER BY random() 
	LIMIT 1;";
$result = pg_query($query);
$record = pg_fetch_object($result);

if(!$record){ // if no results returned
	echo json_encode( array('id'=>NULL) );
}else{ // return the results
	echo json_encode($record,JSON_NUMERIC_CHECK);
}
# close the connection
pg_close($connection);

?>
