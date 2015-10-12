$(document).ready(function() {
  function setHeight() {
    windowHeight = $(window).innerHeight();
    $('#truckmap').css('min-height', (windowHeight*0.75));
  };
  setHeight();
  
  $(window).resize(function() {
    setHeight();
  });
});