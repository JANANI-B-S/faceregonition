const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models') // Load FaceExpressionNet model
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      video.addEventListener('loadeddata', () => {
        createCanvasAndStartDetection();
      });
    })
    .catch(error => {
      console.error('Error accessing the camera:', error);
    });
}

function createCanvasAndStartDetection() {
  // Create a container element
  const container = document.createElement('div');
  container.style.display = 'flex'; // Set the container to flex display

  // Create a canvas for drawing face detection results
  const canvas = faceapi.createCanvasFromMedia(video);
  container.appendChild(canvas); // Append canvas to the container

  // Append the video element to the container
  container.appendChild(video);

  document.body.append(container); // Append the container to the document body

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(detectFacialExpressions, 100);
}

async function detectFacialExpressions() {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
  const canvas = document.querySelector('canvas');

  if (canvas) {
    const resizedDetections = faceapi.resizeResults(detections, { width: video.width, height: video.height });
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }
}




