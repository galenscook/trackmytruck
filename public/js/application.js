$(document).ready(function() {
  freezeWindow();
  function setHeight() {
    windowHeight = $(window).innerHeight();
    if(windowHeight <= 450){

      $('#truckmap').css('min-height', (windowHeight*0.5));
      $('#truckmap').css('max-height', (windowHeight*0.5));

    } else if(windowHeight <= 625){
      $('#sidebar').css('min-height', (windowHeight))
      $('#truckmap').css('min-height', (windowHeight));
      $('#trucklist').css('height', (windowHeight*0.65));
    } else if(windowHeight <= 1120){
      $('#sidebar').css('min-height', (windowHeight))
      $('#truckmap').css('min-height', (windowHeight));
      $('#trucklist').css('height', (windowHeight*0.7));
    } else {

    $('#sidebar').css('min-height', (windowHeight))
    $('#truckmap').css('min-height', (windowHeight));
    $('#trucklist').css('height', (windowHeight*0.75));
    // $('#trucklist').css('max-height', (windowHeight*0.65));
  }
  };
  setHeight();
  
  $(window).resize(function() {
    setHeight();
  });
});

function freezeWindow(){
  var route = /\/trucks$/
  if(route.test($(location).attr('href'))){
    $('body').css('position', 'fixed')
  }
}