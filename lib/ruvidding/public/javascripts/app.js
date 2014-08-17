var constraints = {video: true, audio: true};

var onSuccess = function(stream) {
  var el = document.getElementById('local-video');
  videoEl = document.createElement('video');
  el.appendChild(videoEl);
  videoEl.src = window.URL.createObjectURL(stream);
  videoEl.play();
  videoEl.muted = true;
};

var onError = function (err) {
  console.error('Unable to access camera', err);
};

getUserMedia(constraints, onSuccess, onError);
