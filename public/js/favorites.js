$(document).ready(function(){
  $('.notloggedin').on('click', function(event){
    event.preventDefault();

    $('#loginprompt').fadeIn().delay(3000).fadeOut('slow')
  });

  $('span.right').on('submit', 'form', function(event){
    event.preventDefault();

    var url = $(this).attr('action');
    var method = $(this).attr('method');
    var id = $(this).closest('div.truckpanel').attr('id');

    $.ajax({
      method: method,
      url: url
    })

    .done(function(response){
      // console.log(response);
      $('div#' + id + ' div span').html(response);
    })
  })
})
