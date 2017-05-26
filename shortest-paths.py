# calculate shortest paths between OD pairs
# in the map_speed_od postgis table
# update the shortest path geometry into the table
import requests, json, psycopg2

# get OD pairs from DB
conn_string = (
	"host='localhost' dbname='' user='' password=''"
)
connection = psycopg2.connect(conn_string)
connection.autocommit = True
c = connection.cursor()
c.execute("""
	SELECT 
		id,
		ST_X(ST_StartPoint(vector)) AS lon1,
		ST_Y(ST_StartPoint(vector)) AS lat1,
		ST_X(ST_EndPoint(vector)) AS lon2,
		ST_Y(ST_EndPoint(vector)) AS lat2
	FROM map_speed_od
""")
# iterate over DB pairs
for (rid,lon1,lat1,lon2,lat2) in c.fetchall():
	# request route for these points
	options = {
		'geometries':'geojson',
		'overview':'full',
		'steps':'false',
		'annotations':'false'
	}
	response = requests.get(
		('http://206.167.182.17:5000/route/v1/transit/'+str(lon1)+','+str(lat1)+';'+str(lon2)+','+str(lat2)),
		params=options,
		timeout=5
	)
	# parse the result
	j = json.loads(response.text)
	print json.dumps(j['routes'][0]['geometry'])

	# insert the route result
	c.execute("""
			UPDATE map_speed_od 
			SET shortest_path = ST_SetSRID(ST_GeomFromGeoJSON(%s),4326)
			WHERE id = %s;
		""",
		(json.dumps(j['routes'][0]['geometry']),rid,)
	)

