$(document).ready(function() {
  function setHeight() {
    windowHeight = $(window).innerHeight();
    $('#truckmap').css('min-height', (windowHeight*0.75));
    $('#trucklist').css('max-height', (windowHeight*0.65));
  };
  setHeight();
  
  $(window).resize(function() {
    setHeight();
  });
});