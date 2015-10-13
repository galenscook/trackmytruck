function initMap() {
  var map = new google.maps.Map(document.getElementById('truckmap'), {
    zoom: 17,
    center: {lat: -34.397, lng: 150.644}
  });
  
  var infoWindow = new google.maps.InfoWindow({map: map});
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      // var inRadius = [];
      var inBound = []

      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'YOU!',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });

      map.setCenter(pos);

      // findInBound(trucks);
      // showInBound();

      $.ajax({
        method: 'get',
        url: '/users/get-truck-info',
        dataType: 'json'
      })

      .done(function(response){
        // console.log(response);
        // response = JSON.parse(response);
        var truckCoordinates = response.map(function(object){
          if (object.location){
            var coordinate = JSON.parse(object.location);
            return new google.maps.LatLng(coordinate.J, coordinate.M)
          }
        });

        for(var i = 0; i < response.length; i++){
          if(truckCoordinates[i]){
            new google.maps.Marker({
              position: truckCoordinates[i],
              map: map,
              title: response[i].name,
            });
          }
        };
      });

      // var radius = new google.maps.Circle({
      //   strokeColor: '#FF0000',
      //   strokeOpacity: 0.8,
      //   strokeWeight: 2,
      //   fillColor: '#FF0000',
      //   fillOpacity: 0,
      //   map: map,
      //   center: pos,
      //   radius: 800
      // });

      map.setCenter(pos);

      // findInRadius(trucks);
      // showInRadius();

      // google.maps.event.addListener(marker, 'dragend', function() {
      //   inRadius = [];

      //   for(var i = 0; i < trucks.length; i++){
      //     trucks[i].setMap(null)
      //   };

      //   var position = this.getPosition();

      //   radius.setMap(null);

      //   radius = new google.maps.Circle({
      //     strokeColor: '#FF0000',
      //     strokeOpacity: 0.8,
      //     strokeWeight: 2,
      //     fillColor: '#FF0000',
      //     fillOpacity: 0,
      //     map: map,
      //     center: position,
      //     radius: 800
      //   });

      //   map.setCenter(position);

      //   findInRadius(trucks);
      //   showInRadius();
      // });

      // function findInRadius(trucks){
      //   for(var i = 0; i < trucks.length; i++){
      //     if (radius.getBounds().contains(trucks[i].getPosition())){
      //       inRadius.push(trucks[i]);
      //     };
      //   };
      // };

      // function showInRadius(){
      //   for(var i = 0; i < inRadius.length; i++){
      //     inRadius[i].setMap(map);
      //   }
      // };

      function findInBound(trucks){
        for(var i = 0; i < trucks.length; i++){
          if (map.getBounds().contains(trucks[i].getPosition())){
            inBound.push(trucks[i]);
          };
        };
      }

      function showInBound(){
        for(var i = 0; i < inBound.length; i++){
          inBound[i].setMap(map);
        }
      }

      google.maps.event.addListener(map, 'zoom_changed', function(){
        zoom = map.getZoom();
        if(zoom < 13){
          // for(var i = 0; i < trucks.length; i++){
          //   trucks[i].setMap(null)
          // }
          marker.setMap(null);
        } else{
          // inBound = [];

          // for(var i = 0; i < trucks.length; i++){
          //   trucks[i].setMap(null)
          // };
          if(map.getBounds().contains(marker.getPosition())){
            marker.setMap(map);
          }

          findInBound(trucks);
          showInBound();

          // findInBound(trucks);
          // showInBound();
          // radius.setMap(map);
          // marker.setMap(map);
          // findInRadius(trucks);
          // showInRadius();

        }
      })

      google.maps.event.addListener(map, 'dragend', function(){
        inBound = [];

        // for(var i = 0; i < trucks.length; i++){
        //   trucks[i].setMap(null)
        // };

        marker.setMap(null);

        if(map.getBounds().contains(marker.getPosition())){
          marker.setMap(map);
        }
        // findInBound(trucks);
        // showInBound();
      })
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  };
};

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
