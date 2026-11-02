function drawBurnedBadge(text, elapsedSeconds) {
  const badgeBurnCanvas = document.getElementById("badgeBurnCanvas");
  if (!badgeBurnCanvas.checked) return;

  ctx.save();

  const badgeX = 48;
  const badgeY = 48;
  const badgeH = 64;

  ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "1.5px";

  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;

  const dotMarginLeft = 24;
  const dotDiameter = 18;
  const dotToTextMargin = 16;
  const rightPadding = 32;
  const badgeW = dotMarginLeft + dotDiameter + dotToTextMargin + textW + rightPadding;

  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 32);
  ctx.fill();
  ctx.stroke();

  const pulsePhase = (Math.sin(elapsedSeconds * 4.5) + 1) / 2;
  const dotAlpha = 0.45 + (pulsePhase * 0.55);
  const dotRadius = 9 + (pulsePhase * 2.5);
  const dotCenterX = badgeX + dotMarginLeft + (dotDiameter / 2);
  const dotCenterY = badgeY + (badgeH / 2);

  ctx.fillStyle = `rgba(255, 59, 48, ${dotAlpha})`;
  ctx.shadowColor = "#ff3b30";
  ctx.shadowBlur = 16 * dotAlpha;
  ctx.beginPath();
  ctx.arc(dotCenterX, dotCenterY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  const textStartX = dotCenterX + (dotDiameter / 2) + dotToTextMargin;
  ctx.fillText(text, textStartX, badgeY + (badgeH / 2) + 1);

  ctx.restore();
}

function calculateKenBurns(progress, style, index, intensity) {
  if (style === "none" || intensity <= 0) {
    return { scale: 1.0, panX: 0, panY: 0 };
  }

  let scale = 1.0;
  let panX = 0;
  let panY = 0;

  const isAlternate = (index % 2 === 0);
  const clampedProg = Math.max(0, Math.min(1, progress));

  switch (style) {
    case "cinematic-alternate":
      if (isAlternate) {
        scale = 1.03 + (intensity * clampedProg);
        panX = -(canvas.width * intensity * 0.28) * clampedProg;
        panY = -(canvas.height * intensity * 0.18) * clampedProg;
      } else {
        scale = (1.03 + intensity) - (intensity * clampedProg);
        panX = (canvas.width * intensity * 0.28) * clampedProg;
        panY = (canvas.height * intensity * 0.14) * clampedProg;
      }
      break;
    case "zoom-in":
      scale = 1.02 + (intensity * clampedProg);
      panX = -(canvas.width * intensity * 0.12) * clampedProg;
      panY = -(canvas.height * intensity * 0.12) * clampedProg;
      break;
    case "zoom-out":
      scale = (1.02 + intensity) - (intensity * clampedProg);
      panX = (canvas.width * intensity * 0.12) * clampedProg;
      panY = (canvas.height * intensity * 0.12) * clampedProg;
      break;
    case "pan-horizontal":
      scale = 1.04 + intensity * 0.5;
      const dir = isAlternate ? 1 : -1;
      panX = dir * (canvas.width * intensity * 0.45) * (clampedProg - 0.5);
      panY = 0;
      break;
    default:
      scale = 1.03 + (intensity * clampedProg);
  }

  return { scale, panX, panY };
}

function drawImageLayer(img, scale = 1.0, panX = 0, panY = 0, alpha = 1.0, fitMode = "glass") {
  if (!img || !img.complete) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const cw = canvas.width;
  const ch = canvas.height;
  const imgRatio = img.width / img.height;
  const canvasRatio = cw / ch;

  if (fitMode === "glass") {
    ctx.save();
    ctx.filter = "blur(42px) brightness(0.55)";
    let bgW, bgH;
    if (imgRatio < canvasRatio) {
      bgW = cw * 1.25;
      bgH = (cw / imgRatio) * 1.25;
    } else {
      bgH = ch * 1.25;
      bgW = (ch * imgRatio) * 1.25;
    }
    const bgOffsetX = (cw - bgW) / 2;
    const bgOffsetY = (ch - bgH) / 2;
    ctx.drawImage(img, bgOffsetX, bgOffsetY, bgW, bgH);
    ctx.restore();

    let drawW, drawH;
    if (imgRatio > canvasRatio) {
      drawW = cw * scale;
      drawH = (cw / imgRatio) * scale;
    } else {
      drawH = ch * scale;
      drawW = (ch * imgRatio) * scale;
    }

    const offsetX = (cw - drawW) / 2 + panX;
    const offsetY = (ch - drawH) / 2 + panY;

    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 45;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.shadowBlur = 0;

  } else if (fitMode === "contain") {
    let drawW, drawH;
    if (imgRatio > canvasRatio) {
      drawW = cw * scale;
      drawH = (cw / imgRatio) * scale;
    } else {
      drawH = ch * scale;
      drawW = (ch * imgRatio) * scale;
    }

    const offsetX = (cw - drawW) / 2 + panX;
    const offsetY = (ch - drawH) / 2 + panY;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  } else {
    let drawW, drawH;
    if (imgRatio < canvasRatio) {
      drawW = cw * scale;
      drawH = (cw / imgRatio) * scale;
    } else {
      drawH = ch * scale;
      drawW = (ch * imgRatio) * scale;
    }

    const offsetX = (cw - drawW) / 2 + panX;
    const offsetY = (ch - drawH) / 2 + panY;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  ctx.restore();
}

function drawVignette(intensity) {
  if (intensity <= 0) return;
  ctx.save();
  const cw = canvas.width;
  const ch = canvas.height;
  const radius = Math.max(cw, ch) * 0.72;
  const grad = ctx.createRadialGradient(cw / 2, ch / 2, radius * 0.25, cw / 2, ch / 2, radius);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${intensity})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
}