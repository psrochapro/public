const bulkTimeModal = document.getElementById("bulkTimeModal");
const bulkTimeText = document.getElementById("bulkTimeText");

function openBulkTimeModal() {
  bulkTimeText.value = "";
  bulkTimeModal.style.display = "flex";
  bulkTimeText.focus();
}

function closeBulkTimeModal() {
  bulkTimeModal.style.display = "none";
}

function applyBulkTimings() {
  const rawText = bulkTimeText.value.trim();
  if (!rawText) {
    closeBulkTimeModal();
    return;
  }

  const numbers = [];
  const lines = rawText.split(/\r?\n/);

  for (const line of lines) {
    const clean = line.trim().replace(',', '.');
    const val = parseFloat(clean);
    if (!isNaN(val) && val > 0) {
      numbers.push(val);
    }
  }

  if (numbers.length > 0) {
    for (let i = 0; i < loadedImages.length; i++) {
      if (i < numbers.length) {
        loadedImages[i]._customDuration = numbers[i];
      }
    }
    renderThumbnails();
    syncRecordDurationWithTotal();
  }

  closeBulkTimeModal();
}

async function exportProjectZip() {
  if (typeof JSZip === "undefined") {
    alert("Biblioteca JSZip não carregada.");
    return;
  }
  if (loadedImages.length === 0) {
    alert("Carregue ao menos uma imagem para salvar o projeto.");
    return;
  }

  const zip = new JSZip();
  const assetsFolder = zip.folder("assets");

  const projectData = {
    version: "1.0",
    created_at: new Date().toISOString(),
    settings: {
      badgeText: badgeTextInput.value,
      badgeBurnCanvas: badgeBurnCanvas.checked,
      fitMode: fitModeSelect.value,
      slideTime: parseFloat(slideTimeInput.value),
      transTime: parseFloat(transTimeInput.value),
      motionStyle: motionStyleInput.value,
      motionScale: parseFloat(motionScaleInput.value),
      atmosphereEffect: atmosphereEffectInput.value,
      atmosphereColor: atmosphereColorInput.value,
      atmosphereIntensity: parseFloat(atmosphereIntensityInput.value),
      hudEffect: hudEffectInput.value,
      hudColor: hudColorInput.value,
      hudIntensity: parseFloat(hudIntensityInput.value),
      vignetteIntensity: parseFloat(vignetteInput.value),
      recordDuration: parseFloat(recordDurationInput.value),
      sidebarWidth: sidebarPanel.style.width
    },
    images: []
  };

  for (let i = 0; i < loadedImages.length; i++) {
    const img = loadedImages[i];
    const filename = `image_${i}.png`;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.naturalWidth || img.width;
    tempCanvas.height = img.naturalHeight || img.height;
    const tCtx = tempCanvas.getContext("2d");
    tCtx.drawImage(img, 0, 0);

    const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, "image/png"));
    assetsFolder.file(filename, blob);

    projectData.images.push({
      index: i,
      filename: `assets/${filename}`,
      customDuration: (img._customDuration !== undefined) ? img._customDuration : null,
      customFitMode: img._customFitMode || "auto"
    });
  }

  zip.file("project.json", JSON.stringify(projectData, null, 2));

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "projeto_fundo_animado.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initProjectIO() {
  projectZipInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file || typeof JSZip === "undefined") return;

    try {
      const zip = await JSZip.loadAsync(file);
      const projectJsonFile = zip.file("project.json");
      if (!projectJsonFile) {
        alert("Arquivo project.json não encontrado no ZIP.");
        return;
      }

      const jsonStr = await projectJsonFile.async("string");
      const projectData = JSON.parse(jsonStr);

      const s = projectData.settings || {};
      if (s.badgeText !== undefined) {
        badgeTextInput.value = s.badgeText;
        statusText.textContent = s.badgeText.toUpperCase();
      }
      if (s.badgeBurnCanvas !== undefined) badgeBurnCanvas.checked = s.badgeBurnCanvas;
      if (s.fitMode !== undefined) fitModeSelect.value = s.fitMode;
      if (s.slideTime !== undefined) slideTimeInput.value = s.slideTime;
      if (s.transTime !== undefined) transTimeInput.value = s.transTime;
      if (s.motionStyle !== undefined) motionStyleInput.value = s.motionStyle;
      if (s.motionScale !== undefined) motionScaleInput.value = s.motionScale;
      if (s.atmosphereEffect !== undefined) atmosphereEffectInput.value = s.atmosphereEffect;
      if (s.atmosphereColor !== undefined) atmosphereColorInput.value = s.atmosphereColor;
      if (s.atmosphereIntensity !== undefined) atmosphereIntensityInput.value = s.atmosphereIntensity;
      if (s.hudEffect !== undefined) hudEffectInput.value = s.hudEffect;
      if (s.hudColor !== undefined) hudColorInput.value = s.hudColor;
      if (s.hudIntensity !== undefined) hudIntensityInput.value = s.hudIntensity;
      if (s.vignetteIntensity !== undefined) vignetteInput.value = s.vignetteIntensity;
      if (s.recordDuration !== undefined) recordDurationInput.value = s.recordDuration;
      if (s.sidebarWidth) sidebarPanel.style.width = s.sidebarWidth;

      loadedImages = [];
      const imagesMeta = projectData.images || [];
      imagesMeta.sort((a, b) => a.index - b.index);

      for (const meta of imagesMeta) {
        const zipImgFile = zip.file(meta.filename);
        if (zipImgFile) {
          const blob = await zipImgFile.async("blob");
          const img = new Image();
          img._customDuration = (meta.customDuration !== undefined) ? meta.customDuration : null;
          img._customFitMode = meta.customFitMode || "auto";
          await new Promise(resolve => {
            img.onload = resolve;
            img.src = URL.createObjectURL(blob);
          });
          loadedImages.push(img);
        }
      }

      renderThumbnails();
      updateLabels();
      syncRecordDurationWithTotal();
    } catch (err) {
      alert("Erro ao importar projeto ZIP: " + err.message);
    } finally {
      projectZipInput.value = "";
    }
  });
}