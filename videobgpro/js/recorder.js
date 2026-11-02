let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let recordingStartTime = 0;
let currentExportExtension = "webm";

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (loadedImages.length === 0) return;

  recordedChunks = [];

  const now = performance.now();
  startTimestamp = now;
  recordingStartTime = now;

  const stream = canvas.captureStream(30);

  let chosenMime = "video/webm;codecs=vp9";
  currentExportExtension = "webm";

  if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
    chosenMime = "video/mp4;codecs=avc1";
    currentExportExtension = "mp4";
  } else if (MediaRecorder.isTypeSupported("video/mp4")) {
    chosenMime = "video/mp4";
    currentExportExtension = "mp4";
  } else if (!MediaRecorder.isTypeSupported(chosenMime)) {
    chosenMime = "video/webm";
    currentExportExtension = "webm";
  }

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 6000000
  });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: chosenMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "background.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    resetRecordingUI();
  };

  mediaRecorder.start();
  isRecording = true;

  statusDot.className = "status-dot recording";
  btnRecord.className = "btn btn-danger";
  btnRecord.textContent = "Parar Gravação";
  progressBarContainer.style.display = "block";
  progressBarFill.style.width = "0%";
}

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

function resetRecordingUI() {
  statusDot.className = "status-dot";
  btnRecord.className = "btn btn-primary";
  btnRecord.textContent = "Gravar Vídeo de Fundo";
  progressBarContainer.style.display = "none";
  progressBarFill.style.width = "0%";
}