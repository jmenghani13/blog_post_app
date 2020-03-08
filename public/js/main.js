$('.ok').on('click',function(){
    window.location.href='/';
});


$(document).ready(function(){
  $('.delete-article').on('click',function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/article/'+id,
      success: function(response){
        alert('Deleting Article');
        window.location.href='/';
      },
      error: function(err){
        console.log(err.message);
      }
    });
  });

  $('.like').on('click',function(e){
      $target = $(e.target);
      const id = $target.attr('data-id');
      // AJAX Request
      $.ajax({
          url: '/article/likes/'+id,
          type: 'POST',
          success: function(response){
            window.location.href='/';
          },
          error: function(err){
            console.log(err.message);
          }
      });
  });

  $("#profile_pic").on('click',function(){
    $("#browse").click();
  });

  $("#file-upload").change(function(){
    $("#upload").click();
});


});
