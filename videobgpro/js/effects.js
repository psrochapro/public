const rainDrops = [];
for (let i = 0; i < 180; i++) {
  rainDrops.push({
    x: Math.random() * 1080,
    y: Math.random() * 1920,
    length: 35 + Math.random() * 50,
    speed: 38 + Math.random() * 32,
    thickness: 2.0 + Math.random() * 2.5,
    opacity: 0.5 + Math.random() * 0.4
  });
}

const dustParticles = [];
for (let i = 0; i < 75; i++) {
  dustParticles.push({
    x: Math.random() * 1080,
    y: Math.random() * 1920,
    radius: 4 + Math.random() * 14,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -0.8 - Math.random() * 1.8,
    alpha: 0.4 + Math.random() * 0.5,
    pulseSpeed: 0.02 + Math.random() * 0.05
  });
}

const fogNodes = [];
for (let i = 0; i < 18; i++) {
  fogNodes.push({
    x: Math.random() * 1080,
    y: Math.random() * 1920,
    radius: 400 + Math.random() * 500,
    vx: 0.6 + Math.random() * 1.0,
    alpha: 0.35 + Math.random() * 0.3
  });
}

let lightningFlashAlpha = 0;
let lightningBolts = [];
let lastLightningTime = 0;

function setHudColor(hex) {
  document.getElementById("hudColorInput").value = hex;
}

function setAtmosphereColor(hex) {
  document.getElementById("atmosphereColorInput").value = hex;
}

function hexToRgb(hex) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(c => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function triggerLightning(intensityFactor) {
  lightningFlashAlpha = 0.55 + (intensityFactor * 0.4);
  lightningBolts = [];

  const mainBoltCount = 1 + (Math.random() < 0.4 ? 1 : 0);
  for (let b = 0; b < mainBoltCount; b++) {
    let curX = 180 + Math.random() * 720;
    let curY = 0;
    const boltPoints = [{ x: curX, y: curY }];

    while (curY < 1400) {
      curY += 25 + Math.random() * 45;
      curX += (Math.random() - 0.5) * 90;
      boltPoints.push({ x: curX, y: curY });

      if (Math.random() < 0.32) {
        let branchX = curX;
        let branchY = curY;
        const branchPoints = [{ x: branchX, y: branchY }];
        for (let j = 0; j < 6; j++) {
          branchY += 20 + Math.random() * 35;
          branchX += (Math.random() - 0.45) * 70;
          branchPoints.push({ x: branchX, y: branchY });
        }
        lightningBolts.push({ points: branchPoints, width: 2, alpha: 0.75 });
      }
    }
    lightningBolts.push({ points: boltPoints, width: 5, alpha: 0.95 });
  }
}

function renderAtmosphere(type, intensityFactor) {
  if (type === "none" || intensityFactor <= 0) return;

  ctx.save();
  const atmoRgb = hexToRgb(document.getElementById("atmosphereColorInput").value);

  if (type === "rain") {
    ctx.lineCap = "round";
    for (let drop of rainDrops) {
      ctx.lineWidth = drop.thickness;
      ctx.strokeStyle = `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, ${Math.min(1.0, drop.opacity * intensityFactor * 1.2)})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 7, drop.y + drop.length);
      ctx.stroke();

      drop.y += drop.speed;
      drop.x -= 7;
      if (drop.y > 1920) {
        drop.y = -drop.length;
        drop.x = Math.random() * 1150;
      }
      if (drop.x < 0) drop.x = 1080;
    }
  } else if (type === "particles") {
    for (let p of dustParticles) {
      const currentAlpha = Math.min(1.0, p.alpha * intensityFactor * 1.3);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      const coreR = Math.min(255, Math.floor(atmoRgb.r * 0.4 + 255 * 0.6));
      const coreG = Math.min(255, Math.floor(atmoRgb.g * 0.4 + 255 * 0.6));
      const coreB = Math.min(255, Math.floor(atmoRgb.b * 0.4 + 255 * 0.6));
      grad.addColorStop(0, `rgba(${coreR}, ${coreG}, ${coreB}, ${currentAlpha})`);
      grad.addColorStop(0.5, `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, ${currentAlpha * 0.6})`);
      grad.addColorStop(1, `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < 0) {
        p.y = 1920;
        p.x = Math.random() * 1080;
      }
      if (p.x < 0) p.x = 1080;
      if (p.x > 1080) p.x = 0;
    }
  } else if (type === "fog") {
    for (let fog of fogNodes) {
      const curAlpha = Math.min(0.85, fog.alpha * intensityFactor * 1.4);
      const grad = ctx.createRadialGradient(fog.x, fog.y, 10, fog.x, fog.y, fog.radius);
      grad.addColorStop(0, `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, ${curAlpha})`);
      grad.addColorStop(0.6, `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, ${curAlpha * 0.4})`);
      grad.addColorStop(1, `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
      ctx.fill();

      fog.x += fog.vx;
      if (fog.x - fog.radius > 1080) {
        fog.x = -fog.radius;
        fog.y = Math.random() * 1920;
      }
    }
  } else if (type === "lightning") {
    const now = performance.now();
    const interval = Math.max(1200, 4200 - (intensityFactor * 3000));

    if (now - lastLightningTime > interval) {
      triggerLightning(intensityFactor);
      lastLightningTime = now;
    }

    if (lightningFlashAlpha > 0.01) {
      ctx.fillStyle = `rgba(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b}, ${lightningFlashAlpha * 0.8})`;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.shadowColor = `rgb(${atmoRgb.r}, ${atmoRgb.g}, ${atmoRgb.b})`;
      ctx.shadowBlur = 25;
      for (let bolt of lightningBolts) {
        ctx.lineWidth = bolt.width;
        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha * lightningFlashAlpha})`;
        ctx.beginPath();
        for (let i = 0; i < bolt.points.length; i++) {
          const pt = bolt.points[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      lightningFlashAlpha *= 0.88;
    }
  }
  ctx.restore();
}

let scanlineY = 0;
const spectrumBars = [];
for (let i = 0; i < 32; i++) {
  spectrumBars.push({ height: 0.2, targetHeight: 0.2, speed: 0.1 });
}

function renderCyberHUD(type, intensityFactor, elapsedSeconds) {
  if (type === "none" || intensityFactor <= 0) return;

  ctx.save();
  const factor = Math.min(1.0, intensityFactor);
  const rgb = hexToRgb(document.getElementById("hudColorInput").value);

  if (type === "scanlines") {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * factor})`;
    for (let y = 0; y < 1920; y += 8) {
      ctx.fillRect(0, y, 1080, 4);
    }

    scanlineY = (scanlineY + 7) % 1920;
    const grad = ctx.createLinearGradient(0, scanlineY - 80, 0, scanlineY + 80);
    grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * factor})`);
    grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanlineY - 80, 1080, 160);

    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.85 * factor})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, scanlineY);
    ctx.lineTo(1080, scanlineY);
    ctx.stroke();

  } else if (type === "cybergrid") {
    const cellSize = 60;

    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.65 * factor})`;
    ctx.shadowColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    ctx.shadowBlur = 10 * factor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let x = 0; x <= 1080; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1920);
    }
    for (let y = 0; y <= 1920; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(1080, y);
    }
    ctx.stroke();

    ctx.shadowBlur = 16 * factor;
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.9 * factor})`;
    for (let x = 0; x <= 1080; x += cellSize * 3) {
      for (let y = 0; y <= 1920; y += cellSize * 3) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

  } else if (type === "spectrum") {
    const barWidth = 1080 / spectrumBars.length;
    const baseHeight = 320;

    for (let i = 0; i < spectrumBars.length; i++) {
      const bar = spectrumBars[i];
      if (Math.random() < 0.15) {
        bar.targetHeight = 0.08 + Math.random() * 0.92;
      }
      bar.height += (bar.targetHeight - bar.height) * 0.22;

      const h = bar.height * baseHeight * factor;
      const x = i * barWidth;
      const y = 1920 - h;

      const grad = ctx.createLinearGradient(0, y, 0, 1920);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.95 * factor})`);
      grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.25 * factor})`);

      ctx.fillStyle = grad;
      ctx.fillRect(x + 4, y, barWidth - 8, h);

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.shadowBlur = 8 * factor;
      ctx.fillRect(x + 4, y, barWidth - 8, 4);
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}