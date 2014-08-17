var constraints = {video: true, audio: true};

var onSuccess = function(stream) {
  var $videoEl = $('<video></video)');
  var $el = $('#local-video').append($videoEl);
  $videoEl
    .attr('src', window.URL.createObjectURL(stream))
    .attr('muted', true);
  $videoEl[0].play();
};

var onError = function (err) {
  console.error('Unable to access camera', err);
};

getUserMedia(constraints, onSuccess, onError);
