<script src='/js/truck_map.js'></script>
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=<%= process.env.MAP_KEY %>&signed_in=true&callback=initTruckMap&libraries=geometry"async defer></script>

// var p1 = new google.maps.LatLng(37.785083, -122.397204);

// Calculates distance between two points in km's
module.exports.calcDistance = function(session, truck){
  var p1 = new google.maps.LatLng(37.785083, -122.397204);
  var p2 = new google.maps.LatLng(truck.location["J"], truck.location["M"]);
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
  // alert(calcDistance(p1, p2));
}