
function recordit()
{
	var mediaSource = new MediaSource();
	mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
	var mediaRecorder;
	var recordedBlobs;
	var sourceBuffer;

	//var gumVideo = document.querySelector('video#gum');

    //console.log(55);
    var gumVideo= $('#videos-container .media-container:first>.media-box>video')[0];
    //console.log(gumVideo);

    var recordButton = document.getElementById('record-screen');
    //console.log(recordButton);
	var downloadButton = document.getElementById('download-recording');
	recordButton.onclick = toggleRecording;
	downloadButton.onclick = download;

	// window.isSecureContext could be used for Chrome
	var isSecureOrigin = location.protocol === 'https:' ||
	location.hostname === 'localhost';
	//if (!isSecureOrigin) {
	  //alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
	    //'\n\nChanging protocol to HTTPS');
	//  location.protocol = 'HTTPS';
	//}

	var constraints = {
	  audio: true,
	  video: true
	};

	function handleSuccess(stream) {
	  recordButton.disabled = false;
	  //console.log('getUserMedia() got stream: ', stream);
	  window.stream = stream;
	  gumVideo.srcObject = stream;
	}

	function handleError(error) {
	  console.log('navigator.getUserMedia error: ', error);
	}

	navigator.mediaDevices.getUserMedia(constraints).
	    then(handleSuccess).catch(handleError);

	function handleSourceOpen(event) {
	  console.log('MediaSource opened');
	  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
	  console.log('Source buffer: ', sourceBuffer);
	}


	function handleDataAvailable(event) {
	  if (event.data && event.data.size > 0) {
	    recordedBlobs.push(event.data);
	  }
	}

	function handleStop(event) {
	  console.log('Recorder stopped: ', event);
	}

	function toggleRecording() {
	  if (recordButton.textContent === 'Start Recording') {
	    startRecording();
	  } else {
	    stopRecording();
	    recordButton.textContent = 'Start Recording';
	    downloadButton.disabled = false;
	  }
	}

	function startRecording() {
	  recordedBlobs = [];
	  var options = {mimeType: 'video/webm;codecs=vp9'};
	  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
	    console.log(options.mimeType + ' is not Supported');
	    options = {mimeType: 'video/webm;codecs=vp8'};
	    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
	      console.log(options.mimeType + ' is not Supported');
	      options = {mimeType: 'video/webm'};
	      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
		console.log(options.mimeType + ' is not Supported');
		options = {mimeType: ''};
	      }
	    }
	  }
	  try {
	    mediaRecorder = new MediaRecorder(window.stream, options);
	  } catch (e) {
	    console.error('Exception while creating MediaRecorder: ' + e);
	    alert('Exception while creating MediaRecorder: '
	      + e + '. mimeType: ' + options.mimeType);
	    return;
	  }
	  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
	  recordButton.textContent = 'Stop Recording';
	  downloadButton.disabled = true;
	  mediaRecorder.onstop = handleStop;
	  mediaRecorder.ondataavailable = handleDataAvailable;
	  mediaRecorder.start(10); // collect 10ms of data
	  console.log('MediaRecorder started', mediaRecorder);
	}

	function stopRecording() {
	  mediaRecorder.stop();
	}



	function download() {
	  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
	  var url = window.URL.createObjectURL(blob);
	  var a = document.createElement('a');
	  a.style.display = 'none';
	  a.href = url;
	  a.download = 'test.webm';
	  document.body.appendChild(a);
	  a.click();
	  setTimeout(function() {
	    document.body.removeChild(a);
	    window.URL.revokeObjectURL(url);
	  }, 100);
	}

}

//var el1 = $('.media_container').eq(0);
//recordit(el1);