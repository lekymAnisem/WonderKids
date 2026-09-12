(function () {
  'use strict';

  const SHEETS = {
    'dino-image': { title: 'Dinosaur Adventure', emoji: '🦕', image: '/images/coloring/dinosaur.jpeg' },
    't-rex': {
      title: 'T-Rex at the Volcano', emoji: '🦕',
      svg: '<path d="M 150 235 C 125 220, 120 165, 155 150 C 180 140, 210 150, 235 170 C 260 155, 290 135, 325 125 C 345 130, 350 150, 340 175 C 375 185, 400 200, 415 225" stroke-linecap="round" stroke-width="6"></path><path d="M 150 235 C 150 255, 150 275, 140 300 M 175 240 L 175 300 M 230 252 L 225 305 M 300 258 L 295 310 M 325 252 L 330 305" stroke-linecap="round" stroke-width="7"></path><circle cx="320" cy="148" r="4" fill="#181a2e"></circle><path d="M 415 225 C 390 218, 375 210, 365 200" stroke-linecap="round" stroke-width="6"></path><circle cx="115" cy="75" r="26" stroke-width="4"></circle><path d="M 60 320 C 72 305, 90 305, 102 320 M 100 320 C 112 305, 130 305, 142 320" stroke-linecap="round" stroke-width="5"></path>'
    },
    'space-kitty': {
      title: 'Cosmic Astronaut Kitty', emoji: '🚀',
      svg: '<circle cx="250" cy="150" r="58" stroke-width="6"></circle><path d="M 205 112 L 190 62 L 228 92 M 295 112 L 310 62 L 272 92" stroke-linecap="round" stroke-width="6"></path><circle cx="250" cy="150" r="38" stroke-width="4"></circle><path d="M 230 140 C 232 136, 238 136, 240 140 M 260 140 C 262 136, 268 136, 270 140 M 270 160 C 265 170, 232 172, 229 160" stroke-linecap="round" stroke-width="4"></path><path d="M 214 164 L 198 161 M 218 174 L 204 182 M 286 164 L 302 161 M 282 174 L 296 182" stroke-linecap="round" stroke-width="3"></path><path d="M 250 208 L 250 225 C 250 235, 262 238, 272 230" stroke-linecap="round" stroke-width="5"></path><path d="M 205 205 C 205 185, 295 185, 295 205 L 300 285 L 200 285 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 180 85 L 183 92 L 190 93 L 185 97 L 187 104 L 180 100 L 173 104 L 175 97 L 170 93 L 177 92 Z" stroke-linecap="round" stroke-width="3"></path><path d="M 335 118 A 16 16 0 1 0 348 136 A 21 21 0 0 1 335 118 Z" stroke-linecap="round" stroke-width="4"></path>'
    },
    dolphin: {
      title: 'Friendly Dolphin Reef', emoji: '🐬',
      svg: '<path d="M 140 180 C 130 140, 220 130, 300 165 C 345 183, 385 180, 415 150" stroke-linecap="round" stroke-width="6"></path><path d="M 415 150 C 425 130, 438 138, 428 150 C 438 162, 425 170, 415 150" stroke-linecap="round" stroke-width="5"></path><path d="M 262 158 L 282 128 L 298 162" stroke-linecap="round" stroke-width="6"></path><path d="M 228 178 C 243 194, 260 194, 274 176" stroke-linecap="round" stroke-width="4"></path><circle cx="220" cy="170" r="6" fill="#181a2e"></circle><path d="M 205 150 C 196 143, 196 133, 205 128 C 214 123, 214 113, 205 108" stroke-linecap="round" stroke-width="3"></path><circle cx="420" cy="60" r="24" stroke-width="4"></circle><path d="M 110 240 Q 140 225 170 240 T 230 240 T 290 240 T 350 240 T 410 240 T 470 233" stroke-linecap="round" stroke-width="4"></path><circle cx="150" cy="205" r="4" stroke-width="3"></circle><circle cx="170" cy="217" r="3" stroke-width="3"></circle>'
    },
    butterfly: {
      title: 'Butterfly Garden', emoji: '🦋',
      svg: '<path d="M 250 112 C 238 92, 222 88, 210 86 M 250 112 C 262 92, 278 88, 290 86" stroke-linecap="round" stroke-width="5"></path><path d="M 247 158 C 203 128, 142 138, 148 180 C 154 222, 208 228, 250 205" stroke-linecap="round" stroke-width="6"></path><path d="M 253 158 C 297 128, 358 138, 352 180 C 346 222, 292 228, 250 205" stroke-linecap="round" stroke-width="6"></path><path d="M 247 212 C 215 236, 178 262, 162 242 C 150 220, 180 208, 212 216" stroke-linecap="round" stroke-width="6"></path><path d="M 253 212 C 285 236, 322 262, 338 242 C 350 220, 320 208, 288 216" stroke-linecap="round" stroke-width="6"></path><path d="M 250 120 L 250 262" stroke-linecap="round" stroke-width="8"></path><path d="M 196 162 Q 182 182 196 194 M 304 162 Q 318 182 304 194" stroke-linecap="round" stroke-width="3"></path><path d="M 110 250 C 100 240, 100 228, 110 218 C 120 228, 120 240, 110 250 Z M 110 218 L 110 190 M 96 240 L 74 226 M 124 240 L 146 226" stroke-linecap="round" stroke-width="4"></path><path d="M 150 300 Q 155 276 166 300 M 178 300 Q 183 272 194 300 M 320 300 Q 326 276 338 300 M 352 300 Q 357 272 368 300" stroke-linecap="round" stroke-width="4"></path>'
    },
    castle: {
      title: 'Magic Castle Kingdom', emoji: '🏰',
      svg: '<path d="M 112 250 L 112 125 L 125 125 L 125 108 L 137 108 L 137 125 L 150 125 L 150 108 L 162 108 L 162 125 L 175 125 L 175 108 L 188 108 L 188 125 L 188 250 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 165 250 L 165 175 L 335 175 L 335 250 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 312 250 L 312 125 L 325 125 L 325 108 L 337 108 L 337 125 L 350 125 L 350 108 L 362 108 L 362 125 L 375 125 L 375 108 L 388 108 L 388 125 L 388 250 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 235 175 L 235 110 L 245 110 L 245 95 L 255 95 L 255 110 L 265 110 L 265 175 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 250 70 L 250 95 M 250 75 L 270 88 L 250 100 Z" stroke-linecap="round" stroke-width="4"></path><path d="M 235 250 L 235 210 C 235 192, 265 192, 265 210 L 265 250 Z" stroke-linecap="round" stroke-width="5"></path><circle cx="256" cy="222" r="3" stroke-width="3"></circle><circle cx="200" cy="205" r="12" stroke-width="4"></circle><circle cx="300" cy="205" r="12" stroke-width="4"></circle><path d="M 60 120 C 70 104, 96 104, 106 122 C 116 122, 114 142, 94 142 L 72 142 C 50 142, 50 120, 60 120 Z" stroke-linecap="round" stroke-width="4"></path><circle cx="120" cy="50" r="20" stroke-width="4"></circle>'
    },
    lion: {
      title: 'Lion King of the Savanna', emoji: '🦁',
      svg: '<circle cx="250" cy="165" r="70" stroke-width="7"></circle><circle cx="250" cy="165" r="46" stroke-width="4"></circle><path d="M 208 118 L 202 90 L 228 106 M 292 118 L 298 90 L 272 106" stroke-linecap="round" stroke-width="5"></path><path d="M 210 122 C 200 110, 188 130, 200 140 M 290 122 C 300 110, 312 130, 300 140" stroke-linecap="round" stroke-width="4"></path><circle cx="232" cy="155" r="5" fill="#181a2e"></circle><circle cx="268" cy="155" r="5" fill="#181a2e"></circle><path d="M 242 174 L 258 174 L 250 184 Z" stroke-linecap="round" stroke-width="4"></path><path d="M 228 198 C 238 208, 262 208, 272 198" stroke-linecap="round" stroke-width="4"></path><path d="M 206 176 L 184 170 M 206 188 L 184 194 M 294 176 L 316 170 M 294 188 L 316 194" stroke-linecap="round" stroke-width="3"></path><path d="M 175 235 C 175 215, 325 215, 325 235 L 338 310 L 162 310 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 200 270 L 200 330 M 230 272 L 230 330 M 270 272 L 270 330 M 300 270 L 300 330" stroke-linecap="round" stroke-width="6"></path><path d="M 322 245 C 370 250, 378 300, 392 292" stroke-linecap="round" stroke-width="5"></path><circle cx="392" cy="292" r="7" stroke-width="4"></circle><path d="M 120 330 L 380 330" stroke-linecap="round" stroke-width="5"></path>'
    },
    unicorn: {
      title: 'Rainbow Unicorn Dream', emoji: '🌈',
      svg: '<path d="M 238 128 L 250 72 L 262 128" stroke-linecap="round" stroke-width="5"></path><path d="M 250 86 L 250 112" stroke-linecap="round" stroke-width="3"></path><circle cx="250" cy="172" r="44" stroke-width="6"></circle><path d="M 218 140 L 208 112 L 230 130 M 282 140 L 292 112 L 270 130" stroke-linecap="round" stroke-width="5"></path><circle cx="234" cy="165" r="5" fill="#181a2e"></circle><circle cx="266" cy="165" r="5" fill="#181a2e"></circle><path d="M 242 185 L 258 185 L 250 193 Z" stroke-linecap="round" stroke-width="4"></path><path d="M 228 200 C 238 210, 262 210, 272 200" stroke-linecap="round" stroke-width="4"></path><path d="M 210 155 C 188 185, 205 215, 218 228 M 290 155 C 312 185, 295 215, 282 228" stroke-linecap="round" stroke-width="5"></path><path d="M 160 310 C 160 240, 340 240, 340 310 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 185 305 L 185 345 M 230 312 L 230 345 M 270 312 L 270 345 M 315 305 L 315 345" stroke-linecap="round" stroke-width="6"></path><path d="M 338 262 C 378 262, 388 292, 362 312" stroke-linecap="round" stroke-width="5"></path><path d="M 90 330 Q 120 258 202 292 M 72 345 Q 112 278 192 312 M 54 360 Q 104 298 182 332" stroke-linecap="round" stroke-width="5"></path><path d="M 380 88 L 384 98 L 395 99 L 387 106 L 390 117 L 380 111 L 370 117 L 373 106 L 365 99 L 376 98 Z" stroke-linecap="round" stroke-width="3"></path><circle cx="120" cy="80" r="16" stroke-width="4"></circle>'
    },
    whale: {
      title: 'Whale Song Ocean', emoji: '🌊',
      svg: '<path d="M 115 195 C 115 150, 400 140, 430 195 C 420 240, 150 250, 115 195 Z" stroke-linecap="round" stroke-width="6"></path><path d="M 225 205 C 215 242, 240 258, 265 262" stroke-linecap="round" stroke-width="6"></path><path d="M 430 195 C 458 178, 480 188, 468 195 C 480 202, 458 212, 430 195" stroke-linecap="round" stroke-width="5"></path><circle cx="178" cy="190" r="6" fill="#181a2e"></circle><path d="M 158 215 C 173 228, 193 228, 208 215" stroke-linecap="round" stroke-width="4"></path><path d="M 168 165 L 168 122 M 158 142 C 166 132, 172 132, 178 142 M 158 130 C 166 118, 174 118, 178 130" stroke-linecap="round" stroke-width="4"></path><path d="M 210 235 C 240 245, 280 245, 310 235 M 210 246 C 236 254, 266 254, 292 246" stroke-linecap="round" stroke-width="3"></path><circle cx="235" cy="118" r="6" stroke-width="3"></circle><circle cx="262" cy="98" r="8" stroke-width="3"></circle><circle cx="292" cy="128" r="5" stroke-width="3"></circle><circle cx="80" cy="70" r="22" stroke-width="4"></circle><path d="M 56 120 C 66 104, 92 104, 102 122 C 112 122, 110 142, 90 142 L 68 142 C 46 142, 46 120, 56 120 Z" stroke-linecap="round" stroke-width="4"></path>'
    }
  };

  function initSheetSwitching(resetDrawing) {
    const template = document.getElementById('sheetTemplate');
    const sheetImg = document.getElementById('sheetImage');
    const titleEl = document.getElementById('sheetTitle');
    const emojiEl = document.getElementById('sheetEmoji');
    if (!template) return;

    const cards = Array.prototype.slice.call(document.querySelectorAll('[data-sheet]'));
    if (!cards.length) return;

    const activeClass = 'border-primary-container';
    const activeRing = 'ring-2 ring-primary-container';

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        const key = card.getAttribute('data-sheet');
        const customImage = card.getAttribute('data-custom-image');
        const sheet = SHEETS[key];

        if (customImage) {
          template.style.display = 'none';
          if (sheetImg) { sheetImg.src = customImage; sheetImg.classList.remove('hidden'); }
          var titleText = card.querySelector('h4');
          if (titleEl) titleEl.textContent = titleText ? titleText.textContent : 'Custom Sheet';
          if (emojiEl) emojiEl.textContent = '🎨';
        } else if (sheet) {
          if (sheet.image) {
            template.style.display = 'none';
            if (sheetImg) { sheetImg.src = sheet.image; sheetImg.classList.remove('hidden'); }
          } else {
            template.style.display = '';
            template.innerHTML = sheet.svg;
            if (sheetImg) { sheetImg.classList.add('hidden'); sheetImg.src = ''; }
          }
          if (titleEl) titleEl.textContent = sheet.title;
          if (emojiEl) emojiEl.textContent = sheet.emoji;
        } else {
          return;
        }

        if (resetDrawing) resetDrawing();

        cards.forEach(function (c) { c.classList.remove(activeClass, activeRing); });
        card.classList.add(activeClass, activeRing);

        const panel = document.getElementById('canvasPanel');
        if (panel && window.innerWidth < 1024) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initColoringCanvas() {
    const canvas = document.getElementById('paintCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let painting = false;
    let currentColor = '#FF6B4A';
    let currentSize = 12;
    let drawMode = 'free'; // 'free' or 'fill'
    let initialized = false;
    const history = [];

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (initialized && width === canvas.width && height === canvas.height) return;

      const snapshot = initialized ? canvas.toDataURL('image/png') : null;
      canvas.width = width;
      canvas.height = height;
      initialized = true;

      if (snapshot) {
        const image = new Image();
        image.onload = function () {
          ctx.drawImage(image, 0, 0, width, height);
          history.length = 0;
          history.push(ctx.getImageData(0, 0, width, height));
        };
        image.src = snapshot;
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getPoint(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function hexToRgba(hex) {
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b, 255];
    }

    function getCompositeCanvas() {
      var sheetImgEl = document.getElementById('sheetImage');
      var templateSvg = document.getElementById('sheetTemplate');
      var offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      var oCtx = offscreen.getContext('2d');

      // Draw background image if present
      if (sheetImgEl && sheetImgEl.src && !sheetImgEl.classList.contains('hidden') && sheetImgEl.complete && sheetImgEl.naturalWidth > 0) {
        oCtx.drawImage(sheetImgEl, 0, 0, offscreen.width, offscreen.height);
      }
      // Draw user strokes on top
      oCtx.drawImage(canvas, 0, 0);
      return offscreen;
    }

    function isBoundaryPixel(r, g, b, a) {
      // Treat fully transparent as not a boundary
      if (a < 10) return false;
      // Treat dark pixels (outlines, lines) as boundaries
      var brightness = (r + g + b) / 3;
      return brightness < 80;
    }

    function floodFill(startX, startY, fillColor) {
      var w = canvas.width;
      var h = canvas.height;
      if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

      // Get composite (background + drawing) for boundary detection
      var composite = getCompositeCanvas();
      var compCtx = composite.getContext('2d');
      var compData = compCtx.getImageData(0, 0, w, h).data;

      // Get the drawing canvas data to modify
      var drawData = ctx.getImageData(0, 0, w, h);
      var data = drawData.data;

      var startIdx = (startY * w + startX) * 4;
      var targetColor = [compData[startIdx], compData[startIdx + 1], compData[startIdx + 2], compData[startIdx + 3]];
      var fill = hexToRgba(fillColor);

      // Don't fill if clicking on a boundary (dark outline)
      if (isBoundaryPixel(targetColor[0], targetColor[1], targetColor[2], targetColor[3])) return;

      // Don't fill if target is already the fill color
      var drawTarget = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
      if (Math.abs(drawTarget[0] - fill[0]) < 5 && Math.abs(drawTarget[1] - fill[1]) < 5 &&
          Math.abs(drawTarget[2] - fill[2]) < 5 && drawTarget[3] > 200) return;

      var tolerance = 50;
      var stack = [[startX, startY]];
      var visited = new Uint8Array(w * h);

      function compColorsMatch(idx) {
        var dr = Math.abs(compData[idx] - targetColor[0]);
        var dg = Math.abs(compData[idx + 1] - targetColor[1]);
        var db = Math.abs(compData[idx + 2] - targetColor[2]);
        var da = Math.abs(compData[idx + 3] - targetColor[3]);
        return dr <= tolerance && dg <= tolerance && db <= tolerance && da <= tolerance;
      }

      var maxIterations = w * h;
      var iterations = 0;

      while (stack.length > 0 && iterations < maxIterations) {
        iterations++;
        var point = stack.pop();
        var x = point[0];
        var y = point[1];
        if (x < 0 || x >= w || y < 0 || y >= h) continue;

        var pixelIdx = y * w + x;
        if (visited[pixelIdx]) continue;
        visited[pixelIdx] = 1;

        var idx = pixelIdx * 4;

        // Check if this pixel is a boundary (dark outline from background)
        if (isBoundaryPixel(compData[idx], compData[idx + 1], compData[idx + 2], compData[idx + 3])) continue;

        // Check if composite color matches the target
        if (!compColorsMatch(idx)) continue;

        // Apply fill to the drawing canvas only
        data[idx] = fill[0];
        data[idx + 1] = fill[1];
        data[idx + 2] = fill[2];
        data[idx + 3] = fill[3];

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }

      ctx.putImageData(drawData, 0, 0);
    }

    function startPosition(e) {
      var point = getPoint(e);
      var hint = document.getElementById('paintHint');
      if (hint) hint.style.opacity = '0';

      // Scale coordinates to actual canvas pixel coordinates
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var px = Math.round(point.x * scaleX);
      var py = Math.round(point.y * scaleY);

      if (drawMode === 'fill') {
        floodFill(px, py, currentColor);
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } else {
        painting = true;
        draw(e);
      }
    }

    function endPosition() {
      if (!painting) return;
      painting = false;
      ctx.beginPath();
      if (canvas.width > 0 && canvas.height > 0) {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    }

    function draw(e) {
      if (!painting) return;
      const point = getPoint(e);
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentColor;
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }

    function resetDrawing() {
      if (canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      history.length = 0;
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mouseleave', endPosition);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      startPosition(e);
    }, { passive: false });
    canvas.addEventListener('touchend', endPosition);
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      draw(e);
    }, { passive: false });

    // Color palette
    const chips = document.querySelectorAll('.color-chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('ring-2', 'ring-primary', 'scale-110');
        });
        chip.classList.add('ring-2', 'ring-primary', 'scale-110');
        currentColor = chip.getAttribute('data-color');
      });
    });

    // Brush size
    const sizeBtns = document.querySelectorAll('.brush-size-btn');
    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeBtns.forEach(function (b) {
          b.classList.remove('bg-primary-container', 'text-white');
          b.classList.add('bg-surface-container');
        });
        btn.classList.remove('bg-surface-container');
        btn.classList.add('bg-primary-container', 'text-white');
        currentSize = parseInt(btn.getAttribute('data-size'), 10);
      });
    });

    // Draw mode toggle
    const modeBtns = document.querySelectorAll('.draw-mode-btn');
    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        modeBtns.forEach(function (b) {
          b.classList.remove('bg-primary-container', 'text-white');
          b.classList.add('bg-surface-container');
        });
        btn.classList.remove('bg-surface-container');
        btn.classList.add('bg-primary-container', 'text-white');
        drawMode = btn.getAttribute('data-mode');
        canvas.style.cursor = drawMode === 'fill' ? 'crosshair' : 'crosshair';
      });
    });

    // Clear
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.addEventListener('click', resetDrawing);

    // Undo
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
      undoBtn.addEventListener('click', function () {
        if (history.length > 1) {
          history.pop();
          ctx.putImageData(history[history.length - 1], 0, 0);
        } else {
          resetDrawing();
        }
      });
    }

    function getCompositeImage() {
      var sheetImgEl = document.getElementById('sheetImage');
      var compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = canvas.width;
      compositeCanvas.height = canvas.height;
      var cCtx = compositeCanvas.getContext('2d');

      if (sheetImgEl && sheetImgEl.src && !sheetImgEl.classList.contains('hidden')) {
        cCtx.drawImage(sheetImgEl, 0, 0, compositeCanvas.width, compositeCanvas.height);
      }
      cCtx.drawImage(canvas, 0, 0);
      return compositeCanvas.toDataURL('image/png');
    }

    // Save + Share
    const saveBtn = document.getElementById('saveArtBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async function () {
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Saving...</span>';

        const drawingData = canvas.toDataURL('image/png');
        const compositeData = getCompositeImage();

        try {
          const response = await fetch('/api/canvas/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: drawingData, compositeData: compositeData })
          });
          const data = await response.json();
          saveBtn.innerHTML = '<span>' + (data.message || 'Saved!') + '</span>';
          if (data.success) showSharePrompt(data.id, compositeData);
        } catch (err) {
          saveBtn.innerHTML = '<span>Saved offline! ⭐</span>';
        } finally {
          setTimeout(function () {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
          }, 2000);
        }
      });
    }

    function showSharePrompt(artworkId, compositeImage) {
      var existing = document.getElementById('shareToWallPrompt');
      if (existing) existing.remove();

      var div = document.createElement('div');
      div.id = 'shareToWallPrompt';
      div.className = 'mt-3 p-3 rounded-2xl bg-secondary-fixed border border-secondary flex items-center justify-between gap-3';
      div.innerHTML =
        '<div class="flex items-center gap-2">' +
          '<span class="material-symbols-outlined text-secondary">share</span>' +
          '<span class="text-xs font-bold text-on-surface">Share your artwork on the WonderKids Wall?</span>' +
        '</div>' +
        '<div class="flex gap-2">' +
          '<button id="shareWallYes" class="px-4 py-1.5 rounded-full bg-secondary text-white text-xs font-bold">Share</button>' +
          '<button id="shareWallNo" class="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">Later</button>' +
        '</div>';

      var canvasPanel = document.getElementById('canvasPanel');
      if (canvasPanel) canvasPanel.appendChild(div);

      document.getElementById('shareWallYes').addEventListener('click', function() {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = '/wall/post';

        var fields = { content: 'Check out my artwork!', imageData: compositeImage, artworkId: artworkId };
        Object.keys(fields).forEach(function(k) {
          var inp = document.createElement('input');
          inp.type = 'hidden'; inp.name = k; inp.value = fields[k];
          form.appendChild(inp);
        });
        document.body.appendChild(form);
        form.submit();
      });

      document.getElementById('shareWallNo').addEventListener('click', function() { div.remove(); });
    }

    initSheetSwitching(resetDrawing);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColoringCanvas);
  } else {
    initColoringCanvas();
  }
})();
