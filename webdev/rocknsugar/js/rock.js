        


  // var i;
  // var divs = document.getElementsByTagName('p');
  // for(i=0;i<divs.length;i++) {
  // if(divs[i].className == 'test') {
  // divs[i].innerHTML = divs[i].innerHTML.substring(0,25);
  // }
  // }

  $(document).ready(function() {

    var post = $('#posts li');
    var postpara = $("#posts li p");

    // Hides all top posts after the first 5
    post.hide().filter(':lt(5)').show();

    // Limits the characters in the top posts but skips the first one
    postpara.text(function(index, text) {
      return text.substr(0, 180)+'...';
    });

  });