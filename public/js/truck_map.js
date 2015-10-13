function initTruckMap() {
  var map = new google.maps.Map(document.getElementById('truckmap'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 17
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: "I'm here!",
        icon: 'http://maps.google.com/mapfiles/ms/micons/bus.png',
        // icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        draggable: true
      });

      var truckLocation = {lat: marker.position.lat(), lng: marker.position.lng()};
      console.log(truckLocation);

      google.maps.event.addListener(marker, 'dragend',function(){
        truckLocation = {lat: marker.position.lat(), lng: marker.position.lng()};
        map.setCenter(truckLocation);
      });

      $('form').on('submit', function(event){
        event.preventDefault();

        var url = $(this).attr('action');
        var truckData = {
          location: JSON.stringify(truckLocation),
          closingTime: $('#truck-time-input').val(),
          promo: $('#truck-promo').val()
        };

        console.log(truckData)

        $.ajax({
          method: 'put',
          url: url,
          data: truckData
        })

        .done(function(response){
          console.log(response);
          window.location.replace('/trucks');
        });
      });

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function getTruckLocation(){
  return truckLocation;
}


