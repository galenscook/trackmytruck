$(document).ready(function(){
  $('.notloggedin').on('click', function(event){
    event.preventDefault();
    
    $('#loginprompt').fadeIn().delay(3000).fadeOut('slow')
  })
})