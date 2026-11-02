const canvas = document.getElementById("renderCanvas");
const ctx = canvas.getContext("2d");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const badgeTextInput = document.getElementById("badgeTextInput");
const badgeBurnCanvas = document.getElementById("badgeBurnCanvas");
const previewBadge = document.getElementById("previewBadge");

const sidebarLeft = document.getElementById("sidebarLeft");
const sidebarRight = document.getElementById("sidebarRight");
const resizerLeft = document.getElementById("sidebarResizerLeft");
const resizerRight = document.getElementById("sidebarResizerRight");

const fileInput = document.getElementById("fileInput");
const projectZipInput = document.getElementById("projectZipInput");
const imageList = document.getElementById("imageList");
const imageCountLabel = document.getElementById("imageCountLabel");

const fitModeSelect = document.getElementById("fitModeSelect");
const slideTimeInput = document.getElementById("slideTime");
const transTimeInput = document.getElementById("transTime");
const transStyleSelect = document.getElementById("transStyle");
const motionStyleInput = document.getElementById("motionStyle");
const motionScaleInput = document.getElementById("motionScale");

const colorGradePreset = document.getElementById("colorGradePreset");
const colorGradeColorInput = document.getElementById("colorGradeColorInput");
const colorGradeIntensity = document.getElementById("colorGradeIntensity");

const atmosphereEffectInput = document.getElementById("atmosphereEffect");
const atmosphereColorInput = document.getElementById("atmosphereColorInput");
const atmosphereIntensityInput = document.getElementById("atmosphereIntensity");
const hudEffectInput = document.getElementById("hudEffect");
const hudColorInput = document.getElementById("hudColorInput");
const hudIntensityInput = document.getElementById("hudIntensity");

const tickerEnabled = document.getElementById("tickerEnabled");
const tickerTextInput = document.getElementById("tickerTextInput");
const tickerBgColorInput = document.getElementById("tickerBgColorInput");
const tickerTextColorInput = document.getElementById("tickerTextColorInput");
const tickerFontSize = document.getElementById("tickerFontSize");
const tickerFontSizeVal = document.getElementById("tickerFontSizeVal");

const vignetteInput = document.getElementById("vignetteIntensity");
const recordDurationInput = document.getElementById("recordDuration");
const totalCycleLabel = document.getElementById("totalCycleLabel");
const btnRecord = document.getElementById("btnRecord");
const progressBarContainer = document.getElementById("progressBarContainer");
const progressBarFill = document.getElementById("progressBarFill");

let loadedImages = [];
let draggedIndex = null;

let isResizingLeft = false;
let isResizingRight = false;

resizerLeft.addEventListener("mousedown", (e) => {
  isResizingLeft = true;
  resizerLeft.classList.add("resizing");
  document.body.classList.add("is-resizing");
  e.preventDefault();
});

resizerRight.addEventListener("mousedown", (e) => {
  isResizingRight = true;
  resizerRight.classList.add("resizing");
  document.body.classList.add("is-resizing");
  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (isResizingLeft) {
    const newWidth = e.clientX;
    if (newWidth >= 300 && newWidth <= 580) {
      sidebarLeft.style.width = `${newWidth}px`;
    }
  } else if (isResizingRight) {
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 320 && newWidth <= 640) {
      sidebarRight.style.width = `${newWidth}px`;
    }
  }
});

window.addEventListener("mouseup", () => {
  if (isResizingLeft) {
    isResizingLeft = false;
    resizerLeft.classList.remove("resizing");
  }
  if (isResizingRight) {
    isResizingRight = false;
    resizerRight.classList.remove("resizing");
  }
  document.body.classList.remove("is-resizing");
});

function setColorGradeColor(hex) {
  colorGradeColorInput.value = hex;
}

function setTickerBgColor(hex) {
  if (tickerBgColorInput) tickerBgColorInput.value = hex;
}

function setTickerTextColor(hex) {
  if (tickerTextColorInput) tickerTextColorInput.value = hex;
}

badgeTextInput.addEventListener("input", () => {
  const val = badgeTextInput.value.trim() || "AO VIVO";
  statusText.textContent = val.toUpperCase();
});

const defaultImg = new Image();
defaultImg.crossOrigin = "anonymous";
defaultImg._customDuration = null;
defaultImg._customFitMode = "auto";
defaultImg.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80";
defaultImg.onload = () => {
  if (loadedImages.length === 0) {
    loadedImages.push(defaultImg);
    renderThumbnails();
  }
};

function getImageDuration(index) {
  if (!loadedImages[index]) return parseFloat(slideTimeInput.value);
  const custom = loadedImages[index]._customDuration;
  if (custom !== null && custom !== undefined && !isNaN(custom) && custom > 0) {
    return custom;
  }
  return parseFloat(slideTimeInput.value);
}

function getImageFitMode(index) {
  if (!loadedImages[index]) return fitModeSelect.value;
  const custom = loadedImages[index]._customFitMode;
  if (custom && custom !== "auto") {
    return custom;
  }
  return fitModeSelect.value;
}

function toggleImageFitMode(index) {
  const modes = ["auto", "glass", "cover", "contain"];
  const current = loadedImages[index]._customFitMode || "auto";
  const nextIndex = (modes.indexOf(current) + 1) % modes.length;
  loadedImages[index]._customFitMode = modes[nextIndex];
  renderThumbnails();
}

function getTotalCycleDuration() {
  if (loadedImages.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < loadedImages.length; i++) {
    total += getImageDuration(i);
  }
  return total;
}

function syncRecordDurationWithTotal() {
  const total = getTotalCycleDuration();
  if (total > 0) {
    const rounded = Math.round(total * 10) / 10;
    recordDurationInput.max = Math.max(parseFloat(recordDurationInput.max), Math.ceil(rounded + 10));
    recordDurationInput.value = rounded;
    updateLabels();
  }
}

function updateLabels() {
  document.getElementById("slideTimeVal").textContent = `${slideTimeInput.value}s`;
  document.getElementById("transTimeVal").textContent = `${transTimeInput.value}s`;
  document.getElementById("motionVal").textContent = `${motionScaleInput.value}%`;
  document.getElementById("colorGradeVal").textContent = `${colorGradeIntensity.value}%`;
  document.getElementById("atmosphereVal").textContent = `${atmosphereIntensityInput.value}%`;
  document.getElementById("hudVal").textContent = `${hudIntensityInput.value}%`;
  document.getElementById("vignetteVal").textContent = `${vignetteInput.value}%`;
  document.getElementById("recordDurVal").textContent = `${recordDurationInput.value}s`;

  if (tickerFontSizeVal && tickerFontSize) {
    tickerFontSizeVal.textContent = `${tickerFontSize.value}px`;
  }

  const total = getTotalCycleDuration();
  if (totalCycleLabel) {
    totalCycleLabel.textContent = `${(Math.round(total * 10) / 10)}s`;
  }
}

[slideTimeInput, transTimeInput, motionScaleInput, colorGradeIntensity, atmosphereIntensityInput, hudIntensityInput, tickerFontSize, vignetteInput, recordDurationInput, fitModeSelect].forEach(el => {
  el.addEventListener("input", updateLabels);
});

slideTimeInput.addEventListener("input", () => {
  renderThumbnailsPlaceholders();
  syncRecordDurationWithTotal();
});

function renderThumbnailsPlaceholders() {
  const globalSec = `${slideTimeInput.value}s`;
  document.querySelectorAll(".thumb-duration-input").forEach((inp) => {
    inp.placeholder = globalSec;
  });
}

fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  let pending = files.length;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img._customDuration = null;
      img._customFitMode = "auto";
      img.onload = () => {
        loadedImages.push(img);
        pending--;
        if (pending === 0) {
          renderThumbnails();
          syncRecordDurationWithTotal();
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
  fileInput.value = "";
});

function removeImage(index) {
  loadedImages.splice(index, 1);
  renderThumbnails();
  syncRecordDurationWithTotal();
}

function clearAllImages() {
  loadedImages = [];
  renderThumbnails();
  syncRecordDurationWithTotal();
}

function moveImage(fromIdx, toIdx) {
  if (toIdx < 0 || toIdx >= loadedImages.length) return;
  const item = loadedImages.splice(fromIdx, 1)[0];
  loadedImages.splice(toIdx, 0, item);
  renderThumbnails();
}

function renderThumbnails() {
  imageList.innerHTML = "";
  imageCountLabel.textContent = `${loadedImages.length} carregada(s)`;
  const globalSec = `${slideTimeInput.value}s`;

  loadedImages.forEach((img, idx) => {
    const container = document.createElement("div");
    container.className = "thumb-item-container";
    container.draggable = true;

    container.addEventListener("dragstart", (e) => {
      draggedIndex = idx;
      container.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    container.addEventListener("dragend", () => {
      container.classList.remove("dragging");
      draggedIndex = null;
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== idx) {
        moveImage(draggedIndex, idx);
      }
    });

    const wrapper = document.createElement("div");
    wrapper.className = "image-thumb-wrapper";

    const thumb = document.createElement("img");
    thumb.className = "image-thumb";
    thumb.src = img.src;

    const removeBtn = document.createElement("button");
    removeBtn.className = "thumb-remove-btn";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Remover imagem";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeImage(idx);
    };

    wrapper.appendChild(thumb);
    wrapper.appendChild(removeBtn);

    const durInput = document.createElement("input");
    durInput.type = "number";
    durInput.step = "0.1";
    durInput.min = "0.5";
    durInput.max = "120";
    durInput.className = "thumb-duration-input";
    durInput.placeholder = globalSec;
    durInput.title = `Duração da imagem ${idx + 1} em segundos`;
    if (img._customDuration !== null && img._customDuration !== undefined) {
      durInput.value = img._customDuration;
    }

    durInput.addEventListener("input", () => {
      const val = parseFloat(durInput.value);
      if (!isNaN(val) && val > 0) {
        img._customDuration = val;
      } else {
        img._customDuration = null;
      }
      syncRecordDurationWithTotal();
    });

    const fitBtn = document.createElement("button");
    fitBtn.type = "button";
    const currentMode = img._customFitMode || "auto";
    fitBtn.className = `thumb-mode-btn mode-${currentMode}`;

    const modeLabels = {
      auto: "AUTO",
      glass: "GLASS",
      cover: "COVER",
      contain: "LETTER"
    };
    fitBtn.textContent = modeLabels[currentMode] || "AUTO";
    fitBtn.title = `Modo atual: ${fitBtn.textContent}. Clique para alternar entre Auto, Glass, Cover e Letterbox`;
    fitBtn.onclick = (e) => {
      e.stopPropagation();
      toggleImageFitMode(idx);
    };

    const navBar = document.createElement("div");
    navBar.className = "thumb-nav-bar";

    const leftBtn = document.createElement("button");
    leftBtn.type = "button";
    leftBtn.className = "thumb-nav-btn";
    leftBtn.innerHTML = "&#9664;";
    leftBtn.title = "Mover para a esquerda";
    leftBtn.disabled = (idx === 0);
    leftBtn.onclick = (e) => {
      e.stopPropagation();
      moveImage(idx, idx - 1);
    };

    const rightBtn = document.createElement("button");
    rightBtn.type = "button";
    rightBtn.className = "thumb-nav-btn";
    rightBtn.innerHTML = "&#9654;";
    rightBtn.title = "Mover para a direita";
    rightBtn.disabled = (idx === loadedImages.length - 1);
    rightBtn.onclick = (e) => {
      e.stopPropagation();
      moveImage(idx, idx + 1);
    };

    navBar.appendChild(leftBtn);
    navBar.appendChild(rightBtn);

    container.appendChild(wrapper);
    container.appendChild(durInput);
    container.appendChild(fitBtn);
    container.appendChild(navBar);
    imageList.appendChild(container);
  });

  updateLabels();
}

let startTimestamp = null;

function renderFrame(timestamp) {
  if (!startTimestamp) startTimestamp = timestamp;
  const elapsedTotal = Math.max(0, (timestamp - startTimestamp) / 1000);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (loadedImages.length > 0) {
    const totalCycle = getTotalCycleDuration();
    const motionPercent = parseFloat(motionScaleInput.value) / 100;
    const motionStyle = motionStyleInput.value;
    const transStyle = transStyleSelect.value;
    const atmoType = atmosphereEffectInput.value;
    const atmoIntensity = parseFloat(atmosphereIntensityInput.value) / 100;
    const hudType = hudEffectInput.value;
    const hudIntensity = parseFloat(hudIntensityInput.value) / 100;
    const vignetteAmount = parseFloat(vignetteInput.value) / 100;

    const colorGradeType = colorGradePreset.value;
    const colorGradeColor = colorGradeColorInput.value;
    const colorGradeAmount = parseFloat(colorGradeIntensity.value) / 100;

    if (totalCycle > 0) {
      const currentCycleTime = elapsedTotal % totalCycle;

      let accumulated = 0;
      let currentIndex = 0;
      let currentSlideTime = 0;
      let currentSlideDuration = getImageDuration(0);

      for (let i = 0; i < loadedImages.length; i++) {
        const dur = getImageDuration(i);
        if (currentCycleTime >= accumulated && currentCycleTime < accumulated + dur) {
          currentIndex = i;
          currentSlideTime = currentCycleTime - accumulated;
          currentSlideDuration = dur;
          break;
        }
        accumulated += dur;
      }

      const nextIndex = (currentIndex + 1) % loadedImages.length;
      const transSec = Math.min(parseFloat(transTimeInput.value), currentSlideDuration * 0.85);

      const totalVisibleDuration = currentSlideDuration + transSec;
      const currentImgProgress = (currentSlideTime + transSec) / totalVisibleDuration;

      const currentFit = getImageFitMode(currentIndex);
      const currentMotion = calculateKenBurns(currentImgProgress, motionStyle, currentIndex, motionPercent);

      const fadeStartTime = currentSlideDuration - transSec;
      const isInTransition = (currentSlideTime > fadeStartTime && loadedImages.length > 1);
      const timeIntoFade = isInTransition ? (currentSlideTime - fadeStartTime) : 0;
      const fadeAlpha = isInTransition ? (timeIntoFade / transSec) : 0;

      if (!isInTransition) {
        drawImageLayer(loadedImages[currentIndex], currentMotion.scale, currentMotion.panX, currentMotion.panY, 1.0, currentFit);
      } else {
        const nextSlideDuration = getImageDuration(nextIndex);
        const nextTotalVisible = nextSlideDuration + transSec;
        const nextImgProgress = timeIntoFade / nextTotalVisible;
        const nextFit = getImageFitMode(nextIndex);
        const nextMotion = calculateKenBurns(nextImgProgress, motionStyle, nextIndex, motionPercent);

        if (transStyle === "dip-black") {
          if (fadeAlpha < 0.5) {
            const outAlpha = 1.0 - (fadeAlpha * 2.0);
            drawImageLayer(loadedImages[currentIndex], currentMotion.scale, currentMotion.panX, currentMotion.panY, outAlpha, currentFit);
          } else {
            const inAlpha = (fadeAlpha - 0.5) * 2.0;
            drawImageLayer(loadedImages[nextIndex], nextMotion.scale, nextMotion.panX, nextMotion.panY, inAlpha, nextFit);
          }
        } else if (transStyle === "light-flash") {
          drawImageLayer(loadedImages[currentIndex], currentMotion.scale, currentMotion.panX, currentMotion.panY, 1.0, currentFit);
          drawImageLayer(loadedImages[nextIndex], nextMotion.scale, nextMotion.panX, nextMotion.panY, fadeAlpha, nextFit);
          const flashIntensity = Math.sin(fadeAlpha * Math.PI) * 0.95;
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
          ctx.fillRect(0, 0, 1080, 1920);
          ctx.restore();
        } else if (transStyle === "zoom-push") {
          const pushScaleOut = currentMotion.scale * (1.0 + fadeAlpha * 0.35);
          drawImageLayer(loadedImages[currentIndex], pushScaleOut, currentMotion.panX, currentMotion.panY, 1.0 - fadeAlpha, currentFit);
          const pushScaleIn = nextMotion.scale * (1.35 - fadeAlpha * 0.35);
          drawImageLayer(loadedImages[nextIndex], pushScaleIn, nextMotion.panX, nextMotion.panY, fadeAlpha, nextFit);
        } else {
          drawImageLayer(loadedImages[currentIndex], currentMotion.scale, currentMotion.panX, currentMotion.panY, 1.0, currentFit);
          drawImageLayer(loadedImages[nextIndex], nextMotion.scale, nextMotion.panX, nextMotion.panY, fadeAlpha, nextFit);
        }
      }
    }

    renderAtmosphere(atmoType, atmoIntensity, elapsedTotal);
    applyColorGrading(colorGradeType, colorGradeColor, colorGradeAmount);
    renderCyberHUD(hudType, hudIntensity, elapsedTotal);
    drawVignette(vignetteAmount);

    drawTicker(
      tickerTextInput.value,
      elapsedTotal,
      tickerEnabled.checked,
      tickerBgColorInput ? tickerBgColorInput.value : "#0a0c12",
      tickerTextColorInput ? tickerTextColorInput.value : "#ffffff",
      tickerFontSize ? parseInt(tickerFontSize.value, 10) : 24
    );

    const currentBadgeText = (badgeTextInput.value.trim() || "AO VIVO").toUpperCase();
    drawBurnedBadge(currentBadgeText, elapsedTotal);

    if (badgeBurnCanvas.checked) {
      previewBadge.style.display = "none";
    } else {
      previewBadge.style.display = "flex";
    }
  }

  if (isRecording) {
    const recElapsed = (performance.now() - recordingStartTime) / 1000;
    const targetDuration = parseFloat(recordDurationInput.value);
    const percent = Math.min(100, (recElapsed / targetDuration) * 100);
    progressBarFill.style.width = `${percent}%`;

    if (recElapsed >= targetDuration) {
      stopRecording();
    }
  }

  requestAnimationFrame(renderFrame);
}

initProjectIO();
requestAnimationFrame(renderFrame);