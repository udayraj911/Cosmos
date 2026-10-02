/**
 * Procedural Celestial Texture Generator
 * Generates highly polished, dynamic planetary surface textures using HTML5 canvas
 * and returns a THREE.CanvasTexture. This ensures self-contained offline compatibility
 * and distinct physical surfaces for different planetary species (Gas Giants, Rocky, Ice, Stellar Stars).
 */

function getRgbFromHex(hex: string) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 128;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 128;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 128;
  return { r, g, b };
}

export function createCelestialTexture(THREE: any, type: string, baseColorHex: string) {
  if (typeof document === 'undefined' || !THREE) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const hex = baseColorHex || '#808080';
  const rgb = getRgbFromHex(hex);

  const t = type.toLowerCase();

  if (t.includes('gas') || t.includes('giant') && !t.includes('ice')) {
    // ==========================================
    // GAS GIANT SURFACE: Smooth swirling dynamic bands
    // ==========================================
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 512, 256);

    // Draw horizontal turbulent bands
    const bandCount = 18;
    for (let i = 0; i < bandCount; i++) {
      const y = (i / bandCount) * 256 + (Math.random() - 0.5) * 8;
      const h = 8 + Math.random() * 22;
      const opacity = 0.2 + Math.random() * 0.45;

      // Color variation close to parent color
      const delta = (Math.random() - 0.5) * 75;
      const nr = Math.max(0, Math.min(255, rgb.r + delta + (i % 2 === 0 ? 30 : -35)));
      const ng = Math.max(0, Math.min(255, rgb.g + delta * 0.7 + (i % 3 === 0 ? 20 : -20)));
      const nb = Math.max(0, Math.min(255, rgb.b + delta * 0.5));

      ctx.fillStyle = `rgba(${nr}, ${ng}, ${nb}, ${opacity})`;
      ctx.fillRect(0, y, 512, h);

      // Add a subtle wave to the band (using sin wave curves)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.min(255, nr + 20)}, ${Math.min(255, ng + 20)}, ${Math.min(255, nb + 20)}, ${opacity * 0.4})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      for (let x = 0; x <= 512; x += 10) {
        const sineY = y + h / 2 + Math.sin(x * 0.05 + i) * 3;
        if (x === 0) ctx.moveTo(x, sineY);
        else ctx.lineTo(x, sineY);
      }
      ctx.stroke();
    }

    // Great Red Spot / storm swirls
    const stormX = 340;
    const stormY = 160;
    const stormR = 24;
    const stormGrad = ctx.createRadialGradient(stormX, stormY, 2, stormX, stormY, stormR);
    stormGrad.addColorStop(0, `rgba(${Math.max(0, rgb.r - 80)}, ${Math.max(0, rgb.g - 120)}, ${Math.max(0, rgb.b - 120)}, 0.95)`);
    stormGrad.addColorStop(0.5, `rgba(${rgb.r}, ${Math.max(0, rgb.g - 60)}, ${Math.max(0, rgb.b - 60)}, 0.75)`);
    stormGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = stormGrad;
    ctx.beginPath();
    ctx.arc(stormX, stormY, stormR, 0, Math.PI * 2);
    ctx.fill();

    // Additional minor cyclone whorls
    for (let c = 0; c < 3; c++) {
      const cx = 100 + c * 150 + Math.random() * 40;
      const cy = 60 + Math.random() * 80;
      const cr = 8 + Math.random() * 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Atmospheric gaseous noise grain overlay
    for (let n = 0; n < 1200; n++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(x, y, 2, 2);
    }

  } else if (t.includes('ice') || t.includes('cryo') || t.includes('frozen')) {
    // ==========================================
    // ICE GIANT SURFACE: Glacial cracks & supersonic wispy clouds
    // ==========================================
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, hex);
    
    // Frost white tints
    const nr = Math.min(255, rgb.r + 65);
    const ng = Math.min(255, rgb.g + 65);
    const nb = Math.min(255, rgb.b + 75);
    gradient.addColorStop(0.5, `rgb(${nr}, ${ng}, ${nb})`);
    gradient.addColorStop(1, hex);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);

    // Dynamic crystalline frozen sweep segments (supersonic storms)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 256);
      ctx.bezierCurveTo(
        128 + Math.random() * 60, Math.random() * 256, 
        384 - Math.random() * 60, Math.random() * 256, 
        512, Math.random() * 256
      );
      ctx.stroke();
    }

    // Icy fractures/cracks map lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 12; i++) {
      let x = Math.random() * 512;
      let y = Math.random() * 256;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const points = 4 + Math.floor(Math.random() * 5);
      for (let s = 0; s < points; s++) {
        x += (Math.random() - 0.5) * 35;
        y += (Math.random() - 0.5) * 35;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

  } else if (t.includes('rock') || t.includes('terrestrial') || t.includes('crust') || t.includes('metal') || t.includes('dwarf')) {
    // ==========================================
    // ROCKY PLANET SURFACE: Mottled continents & circular impact craters
    // ==========================================
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 512, 256);

    // Continental plates mottled groupings
    for (let p = 0; p < 9; p++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = 40 + Math.random() * 70;
      
      const pGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      // Lighter mantle spots or darker basalt basins
      const factor = p % 2 === 0 ? 45 : -40;
      const nr = Math.max(0, Math.min(255, rgb.r + factor));
      const ng = Math.max(0, Math.min(255, rgb.g + factor * 0.9));
      const nb = Math.max(0, Math.min(255, rgb.b + factor * 0.8));
      
      pGrad.addColorStop(0, `rgba(${nr}, ${ng}, ${nb}, 0.7)`);
      pGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // High detail moon-like circular asteroid impact craters
    for (let c = 0; c < 22; c++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = 3 + Math.random() * 14;

      // Dark shadow center bowl
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Light reflective crescent rim (gives authentic depth contouring)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 0.25, Math.PI * 1.25);
      ctx.stroke();

      // Small secondary inner peak
      if (r > 8 && Math.random() > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

  } else if (t.includes('stellar') || t.includes('star') || t.includes('dwarf star') || t.includes('sun')) {
    // ==========================================
    // STELLAR STARS: Blazing plasma solar granules & flares
    // ==========================================
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 512, 256);

    // Overlay bright nuclear flares
    for (let s = 0; s < 18; s++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 256;
      const r = 30 + Math.random() * 65;
      
      const sGrad = ctx.createRadialGradient(sx, sy, 4, sx, sy, r);
      sGrad.addColorStop(0, '#ffffff'); // superheated hot white core
      sGrad.addColorStop(0.35, '#ffcc00'); // burning yellow
      sGrad.addColorStop(0.7, '#ff3300'); // cooling solar flare red
      sGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // ==========================================
    // DEFAULT SURFACE: Mixed organic marble bands with thin clouds
    // ==========================================
    // Fill first with gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, hex);
    grad.addColorStop(0.5, '#1e293b'); // space slate grey contrast
    grad.addColorStop(1, hex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Mottled land mass representations
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)'; // green landmass layers
    for (let m = 0; m < 6; m++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, 25 + Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Atmospheric cloud overlays (wispy white bands)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let w = 0; w < 5; w++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512, Math.random() * 256, 
        45 + Math.random() * 65, 8 + Math.random() * 12, 
        Math.random() * 0.4, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
