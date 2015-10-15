function initMap() {
  var map = new google.maps.Map(document.getElementById('truckmap'), {
    zoom: 14,
    center: {lat: -34.397, lng: 150.644}
  });

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

      var sessionPosition = {lat: marker.position.lat(), lng: marker.position.lng()};

      var sessionData = {
          location: JSON.stringify(sessionPosition),
        };

      $.ajax({
        method: 'put',
        url: '/sessions/set-location',
        data: sessionData
      })

      .done(function(response){
      });

      var userPosition = {lat: marker.position.lat(), lng: marker.position.lng()};

      var userData = {
          location: JSON.stringify(userPosition),
        };

      $.ajax({
        method: 'put',
        url: '/users/set-location',
        data: userData
      })

      .done(function(response){
      });


      var trucks = [];
      var truckInfo = new google.maps.InfoWindow({
        content: ''
      });

      $.ajax({
        method: 'get',
        url: '/users/get-truck-info',
        dataType: 'json'
      })

      .done(function(response){
        var truckCoordinates = response.map(function(object){
          if (object.location){
            var coordinate = JSON.parse(object.location);
            return coordinate;
          }
        });

        for(var i = 0; i < response.length; i++){
          if(truckCoordinates[i]){
            var truckMarker = new google.maps.Marker({
              position: truckCoordinates[i],
              map: map,
              title: response[i].name,
              id: response[i].id,
            });

            var truckDesc = '<h1><a href="' + response[i].yelpInfo.url  + '" target="_blank">' + response[i].name + '</a></h1>' + '<br><img src="' + response[i].yelpInfo.mediumRating + '">' + response[i].yelpInfo.review_count + 'Reviews' + '<br><strong>Category:</strong>' + response[i].yelpInfo.categories[0][0] + '<br><strong>Description:</strong>' + '<br>' + response[i].description + '<br><strong>Promotions:</strong>' + '<br>' + response[i].promo;

            trucks.push(truckMarker);

            bindInfoWindow(truckMarker, map, truckInfo, truckDesc)
          }
        };

        findInBound(trucks);
        showInBound();
      });

      function findInBound(trucks){
        // var inBoundId = [];

        for(var i = 0; i < trucks.length; i++){
          if (map.getBounds().contains(trucks[i].position)){
            inBound.push(trucks[i]);
            // inBoundId.push(trucks[i].id)
          };
        };

      //*****************
      //* DON'T  DELETE *
      //*  FUTURE  USE  *
      //*****************

      //   $.ajax({
      //     url: '/trucks/update-truck-list',
      //     data: {trucks: JSON.stringify(inBoundId)},
      //     method: 'put'
      //   })

      //   .done(function(response){
      //     console.log(response)
      //   });
      }

      function showInBound(){
        for(var i = 0; i < inBound.length; i++){
          inBound[i].setMap(map);
        }
      }

      google.maps.event.addListener(map, 'zoom_changed', function(){
        findInBound(trucks);
        showInBound();
      });

      google.maps.event.addListener(map, 'dragend', function(){
        inBound = [];

        for(var i = 0; i < trucks.length; i++){
          trucks[i].setMap(null)
        };

        findInBound(trucks);
        showInBound();
      });

      $('.truckpanel').on('click', function(event){

        var truckId = $(this).attr('id');

        trucks.forEach(function(truck){
          if(truck.id == truckId){
            if (!map.getBounds().contains(truck.position)){
              map.panTo(truck.position)
              findInBound(trucks);
              showInBound();
            };
            google.maps.event.trigger(truck, 'click');
          }
        })
      });

      google.maps.event.addListener(map, 'dragend', function(){
        truckInfo.close();
      });

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

function bindInfoWindow(marker, map, infowindow, description) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(description);
    infowindow.open(map, marker);
    $('#' + marker.id)[0].scrollIntoView();
  });
}
