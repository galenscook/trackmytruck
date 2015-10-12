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

      // console.log(pos);

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'YOU!',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });

      var truck1 = new google.maps.Marker({
              position: {lat: 37.784778021272416, lng: -122.3962264976227},
              map: map,
              title: 'Truck 1'
            });

      var truck2 = new google.maps.Marker({
              position: {lat: 37.78671973034361, lng: -122.4032860717499},
              map: map,
              title: 'Truck 2'
            });

      var truck3 = new google.maps.Marker({
              position: {lat: 37.78858507965642, lng: -122.40667638394473},
              map: map,
              title: 'Truck 3'
            });

      var truck4 = new google.maps.Marker({
              position: {lat: 37.78844941947592, lng: -122.41375741574404},
              map: map,
              title: 'Truck 4'
            });

      var truck5 = new google.maps.Marker({
              position: {lat: 37.78695714105294, lng: -122.41422948453067},
              map: map,
              title: 'Truck 5'
            });

      var truck6 = new google.maps.Marker({
              position: {lat: 37.78556658176349, lng: -122.4165039977753},
              map: map,
              title: 'Truck 6'
            });

      var truck7 = new google.maps.Marker({
              position: {lat: 37.78651623484282, lng: -122.41800603482363},
              map: map,
              title: 'Truck 7'
            });

      var truck8 = new google.maps.Marker({
              position: {lat: 37.78868682462838, lng: -122.4185210189545},
              map: map,
              title: 'Truck 8'
            });

      var truck9 = new google.maps.Marker({
              position: {lat: 37.78990775336479, lng: -122.42186841580508},
              map: map,
              title: 'Truck 9'
            });

      var truck10 = new google.maps.Marker({
              position: {lat: 37.78916163264523, lng: -122.42465791318057},
              map: map,
              title: 'Truck 10'
            });

      var truck11 = new google.maps.Marker({
              position: {lat: 37.78811026793499, lng: -122.42482957455752},
              map: map,
              title: 'Truck 11'
            });

      var truck12 = new google.maps.Marker({
              position: {lat: 37.78692322528404, lng: -122.4254733047211},
              map: map,
              title: 'Truck 12'
            });

      var truck13 = new google.maps.Marker({
              position: {lat: 37.78529525007087, lng: -122.42620286557315},
              map: map,
              title: 'Truck 13'
            });

      var truck14 = new google.maps.Marker({
              position: {lat: 37.78705888826634, lng: -122.4287348708832},
              map: map,
              title: 'Truck 14'
            });

      var truck15 = new google.maps.Marker({
              position: {lat: 37.78583791245993, lng: -122.4287348708832},
              map: map,
              title: 'Truck 15'
            });

      var trucks = [truck1, truck2, truck3, truck4, truck5, truck6, truck7, truck8, truck9, truck10, truck11, truck12, truck13, truck14, truck15];

      for(var i = 0; i < trucks.length; i++){
        trucks[i].setMap(null)
      };
      // truck.setMap(null);

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

      findInBound(trucks);
      showInBound();
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
          for(var i = 0; i < trucks.length; i++){
            trucks[i].setMap(null)
          }
          marker.setMap(null);
        } else{
          inBound = [];

          for(var i = 0; i < trucks.length; i++){
            trucks[i].setMap(null)
          };
          if(map.getBounds().contains(marker.getPosition())){
            marker.setMap(map);
          }
          findInBound(trucks);
          showInBound();
          // radius.setMap(map);
          // marker.setMap(map);
          // findInRadius(trucks);
          // showInRadius();
        }
      })

      google.maps.event.addListener(map, 'dragend', function(){
        inBound = [];

        for(var i = 0; i < trucks.length; i++){
          trucks[i].setMap(null)
        };

        marker.setMap(null);

        if(map.getBounds().contains(marker.getPosition())){
          marker.setMap(map);
        }
        findInBound(trucks);
        showInBound();
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

// function createTruckMarkers(listOfTrucks)
//   for(var i = 0; i < listOfTrucks.length; i++){
    // if(listOfTrucks[i].name is user's favorite){
      // var newTruckMarker = new google.maps.Marker({
      //   position: listOfTrucks[i].location,
      //   map: map,
      //   title: listOfTrucks[i].name,
      //   icon: 'favorite icon'
      // })
    //} else{
      // var newTruckMarker = new google.maps.Marker({
      //   position: listOfTrucks[i].location,
      //   map: map,
      //   title: listOfTrucks[i].name,
      //   icon: 'normal icon'
      // })
//     }
//  return newTruckMarker;
//   }
// }
