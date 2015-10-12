$(document).ready(function() {
  function setHeight() {
    windowHeight = $(window).innerHeight();
    if(windowHeight <= 450){

      $('#truckmap').css('min-height', (windowHeight*0.5));
      $('#truckmap').css('max-height', (windowHeight*0.5));

    } else {

    $('#truckmap').css('min-height', (windowHeight*0.75));
    $('#trucklist').css('max-height', (windowHeight*0.65));
    // $('#trucklist').css('max-height', (windowHeight*0.65));
  }
  };
  setHeight();
  
  $(window).resize(function() {
    setHeight();
  });
});