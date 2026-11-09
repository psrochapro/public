/* js/animation-engine.js - Motor Modular de Animações e Parallax */

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function getOrganicDrift(elapsedSeconds, intensityFactor) {
  if (!elapsedSeconds || intensityFactor <= 0) {
    return { x: 0, y: 0, rot: 0 };
  }
  const t = elapsedSeconds;
  const factor = Math.min(1.0, intensityFactor);

  const driftX = (Math.sin(t * 0.72) * 12 + Math.cos(t * 0.38) * 8) * factor;
  const driftY = (Math.cos(t * 0.65) * 10 + Math.sin(t * 0.29) * 6) * factor;
  const driftRot = (Math.sin(t * 0.45) * 0.012) * factor;

  return { x: driftX, y: driftY, rot: driftRot };
}

function computeEnhancedMotion(progress, style, index, intensity, elapsedSeconds, canvasWidth, canvasHeight) {
  if (style === "none" || intensity <= 0) {
    return {
      scale: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      bgScale: 1.0,
      bgPanX: 0,
      bgPanY: 0
    };
  }

  const clampedProg = Math.max(0, Math.min(1, progress));
  const eased = easeInOutCubic(clampedProg);
  const sineProg = easeInOutSine(clampedProg);
  const isAlternate = (index % 2 === 0);

  const drift = getOrganicDrift(elapsedSeconds, intensity * 0.6);

  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let rotation = drift.rot;

  let bgScale = 1.0;
  let bgPanX = 0;
  let bgPanY = 0;

  switch (style) {
    case "cinematic-alternate":
      if (isAlternate) {
        scale = 1.03 + (intensity * eased);
        panX = -(canvasWidth * intensity * 0.25) * eased + drift.x;
        panY = -(canvasHeight * intensity * 0.16) * eased + drift.y;
        rotation += (intensity * 0.018 * (eased - 0.5));

        bgScale = (1.08 + intensity * 0.5) - (intensity * 0.4 * eased);
        bgPanX = (canvasWidth * intensity * 0.18) * eased;
        bgPanY = (canvasHeight * intensity * 0.12) * eased;
      } else {
        scale = (1.03 + intensity) - (intensity * eased);
        panX = (canvasWidth * intensity * 0.25) * eased + drift.x;
        panY = (canvasHeight * intensity * 0.14) * eased + drift.y;
        rotation -= (intensity * 0.018 * (eased - 0.5));

        bgScale = 1.0 + (intensity * 0.45 * eased);
        bgPanX = -(canvasWidth * intensity * 0.18) * eased;
        bgPanY = -(canvasHeight * intensity * 0.12) * eased;
      }
      break;

    case "zoom-in":
      scale = 1.02 + (intensity * eased);
      panX = -(canvasWidth * intensity * 0.14) * eased + drift.x;
      panY = -(canvasHeight * intensity * 0.14) * eased + drift.y;
      rotation += (intensity * 0.012 * (eased - 0.5));

      bgScale = 1.08 - (intensity * 0.3 * eased);
      bgPanX = (canvasWidth * intensity * 0.1) * eased;
      bgPanY = (canvasHeight * intensity * 0.1) * eased;
      break;

    case "zoom-out":
      scale = (1.02 + intensity) - (intensity * eased);
      panX = (canvasWidth * intensity * 0.14) * eased + drift.x;
      panY = (canvasHeight * intensity * 0.14) * eased + drift.y;
      rotation -= (intensity * 0.012 * (eased - 0.5));

      bgScale = 1.0 + (intensity * 0.35 * eased);
      bgPanX = -(canvasWidth * intensity * 0.1) * eased;
      bgPanY = -(canvasHeight * intensity * 0.1) * eased;
      break;

    case "pan-horizontal": {
      scale = 1.04 + intensity * 0.4;
      const dir = isAlternate ? 1 : -1;
      panX = dir * (canvasWidth * intensity * 0.42) * (sineProg - 0.5) + drift.x;
      panY = drift.y;
      rotation += (dir * intensity * 0.01 * (sineProg - 0.5));

      bgScale = 1.05;
      bgPanX = -panX * 0.5;
      bgPanY = -drift.y * 0.5;
      break;
    }

    case "drift-cinematic": {
      const angle = isAlternate ? 0.022 : -0.022;
      scale = 1.04 + (intensity * 0.8 * sineProg);
      const dirX = isAlternate ? -1 : 1;
      const dirY = isAlternate ? -1 : 1;
      panX = dirX * (canvasWidth * intensity * 0.28) * (eased - 0.5) + drift.x;
      panY = dirY * (canvasHeight * intensity * 0.22) * (eased - 0.5) + drift.y;
      rotation += angle * intensity * (sineProg - 0.5);

      bgScale = 1.06 + (intensity * 0.35 * (1.0 - sineProg));
      bgPanX = -panX * 0.6;
      bgPanY = -panY * 0.6;
      break;
    }

    case "dolly-vertigo":
      scale = 1.01 + (intensity * 1.25 * eased);
      panX = drift.x * 0.7;
      panY = drift.y * 0.7;
      rotation += (intensity * 0.008 * (eased - 0.5));

      bgScale = (1.18 + intensity * 0.6) - (intensity * 0.85 * eased);
      bgPanX = -drift.x * 0.5;
      bgPanY = -drift.y * 0.5;
      break;

    case "breathing-pulse": {
      const pulseT = (Math.sin(clampedProg * Math.PI * 2) + 1) / 2;
      const pulseEased = easeInOutSine(pulseT);
      scale = 1.02 + (intensity * 0.55 * pulseEased);
      panX = (canvasWidth * intensity * 0.08) * (pulseEased - 0.5) + drift.x;
      panY = (canvasHeight * intensity * 0.08) * (pulseEased - 0.5) + drift.y;
      rotation += drift.rot * 1.5;

      bgScale = 1.05 + (intensity * 0.3 * (1.0 - pulseEased));
      bgPanX = -panX * 0.4;
      bgPanY = -panY * 0.4;
      break;
    }

    default:
      scale = 1.03 + (intensity * eased);
      panX = drift.x;
      panY = drift.y;
  }

  return {
    scale,
    panX,
    panY,
    rotation,
    bgScale,
    bgPanX,
    bgPanY
  };
}