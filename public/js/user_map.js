function initMap() {
  var map = new google.maps.Map(document.getElementById('truckmap'), {
    zoom: 14,
    center: {lat: -34.397, lng: 150.644}
  });
  var styles = [
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#33658A"
            },
            {
                "saturation": 38
            },
            {
                "lightness": -11
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#8ABB21"
            },
            {
                "saturation": -47
            },
            {
                "lightness": -17
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#c6e3a4"
            },
            {
                "saturation": 17
            },
            {
                "lightness": -2
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#cccccc"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 13
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#5f5855"
            },
            {
                "saturation": 6
            },
            {
                "lightness": -31
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
]
  map.setOptions({styles: styles});
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
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

        $.ajax({
          method: 'get',
          url: '/users/get-user-favorites',
          dataType: 'json'
        })

        .always(function(response2){
          favoritesArray = [];
          if(response2.length > 0){
            var userFavorites = response2.map(function(object){
              favoritesArray.push(object.id)
            })
          }

          for(var i = 0; i < response.length; i++){
            if(truckCoordinates[i]){
              if(favoritesArray.contains(response[i].id)){
                var truckMarker = new google.maps.Marker({
                  position: truckCoordinates[i],
                  map: map,
                  title: response[i].name,
                  id: response[i].id,
                  icon: 'https://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin_star||F09D16|000000'
                  // icon: 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png'
                  // icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                });
              }else{
                var truckMarker = new google.maps.Marker({
                  position: truckCoordinates[i],
                  map: map,
                  title: response[i].name,
                  id: response[i].id,
                  // icon: 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png'
                  // icon: 'https://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin_star||F09D16|E65601'
                  icon: 'https://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin||63BFDB|000000'
                  // icon: 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=F09D16|'
                  // icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
                });
              }
              var truckDesc = '<div id="truck-popup"><h3><a href="' + response[i].yelpInfo.url  + '" target="_blank">' + response[i].name + '</a></h3>' + '<br><img src="' + response[i].yelpInfo.mediumRating + '">' + "  " + response[i].yelpInfo.review_count + " " + 'Reviews' + '<br><strong>Category: </strong>' + response[i].yelpInfo.categories[0][0] + '<br><strong>Description:</strong>' + '<br>' + response[i].description + '<br><strong>Promotions: </strong>' + '<br>' + response[i].promo + '</div>';
                // infoWindow.style.backgroundImage="url('http://assets.nydailynews.com/polopoly_fs/1.1245686!/img/httpImage/image.jpg_gen/derivatives/article_970/afp-cute-puppy.jpg')";
              // document.getElementById("truck-popup").style.backgroundImage = "url('img_tree.png')";
              trucks.push(truckMarker);
              bindInfoWindow(truckMarker, map, truckInfo, truckDesc)
            }
          };
        });

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
    var parentDiv = $('#truck-popup').parent();
    var grandparentDiv = parentDiv.parent();
    greatGPparentDiv = grandparentDiv.parent();
    greatGPparentDiv.parent().css("background-image", "url('http://cdn.sheknows.com/articles/2013/04/Puppy_2.jpg') no-repeat");
    $('#' + marker.id)[0].scrollIntoView();
  });
}

Array.prototype.contains = function(k) {
  for(var i=0; i < this.length; i++){
    if(this[i] === k){
      return true;
    }
  }
  return false;
}
