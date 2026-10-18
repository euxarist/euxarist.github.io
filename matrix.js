"use strict";
document.addEventListener('DOMContentLoaded', function () {
    const canvasEl = document.getElementById('matrix-canvas');
    if (!canvasEl) {
        console.error('Matrix canvas not found');
        return;
    }
    const canvas = canvasEl;
    const ctxEl = canvas.getContext('2d');
    if (!ctxEl) {
        console.error('Could not get canvas context');
        return;
    }
    const ctx = ctxEl;
    const matrix = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const chars = matrix.split('');
    const fontSize = 14;
    function getInitialViewportHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight);
    }
    // Cap at 2x: a 3x phone would triple the fill cost every frame for no
    // visible gain on glyphs this small.
    function pixelRatio() {
        return Math.min(window.devicePixelRatio || 1, 2);
    }
    // The backing store must be sized in device pixels or the canvas renders at
    // 1x and is upscaled by the DPR, which is what made the matrix look soft on
    // phones. Setting width/height resets the transform, so re-apply the scale.
    function applyCanvasSize(cssWidth, cssHeight) {
        const ratio = pixelRatio();
        canvas.width = Math.round(cssWidth * ratio);
        canvas.height = Math.round(cssHeight * ratio);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    // A translucent black wash never hits zero in 8-bit, so old glyphs stayed
    // as a green field. Draw each streak from scratch and let its tail alpha
    // land on zero instead.
    const trailLength = 28;
    const glyphStyles = [];
    const trailLast = trailLength - 1;
    for (let age = 0; age < trailLength; age++) {
        const opacity = Math.pow(1 - age / trailLast, 2.15);
        if (opacity < 0.02) {
            glyphStyles.push('');
            continue;
        }
        const hot = Math.max(0, 1 - age / 3);
        const red = Math.round(190 * hot);
        const blue = Math.round(100 + 110 * hot);
        glyphStyles.push(`rgba(${red}, 255, ${blue}, ${opacity.toFixed(3)})`);
    }
    function makeStream() {
        return { nextRow: Math.random() * -100, glyphs: [] };
    }
    let streams = [];
    let lockedHeight = getInitialViewportHeight();
    let lockedWidth = window.innerWidth;
    function ensureStreams(count) {
        if (count === streams.length) {
            return;
        }
        const next = [];
        for (let x = 0; x < count; x++) {
            next.push(x < streams.length ? streams[x] : makeStream());
        }
        streams = next;
    }
    function resizeCanvas() {
        const newWidth = window.innerWidth;
        const newHeight = getInitialViewportHeight();
        const newColumns = Math.floor(newWidth / fontSize);
        const widthDiff = Math.abs(lockedWidth - newWidth);
        const heightDiff = Math.abs(lockedHeight - newHeight);
        // Only resize on significant changes (ignore address bar show/hide)
        if (widthDiff > 50 || heightDiff > 200) {
            lockedWidth = newWidth;
            lockedHeight = newHeight;
            applyCanvasSize(lockedWidth, lockedHeight);
            ensureStreams(newColumns);
        }
    }
    applyCanvasSize(lockedWidth, lockedHeight);
    ensureStreams(Math.floor(lockedWidth / fontSize));
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 250);
    }
    // Use visualViewport on iOS to avoid address bar resize noise
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', function () { }, { passive: true });
    }
    else {
        window.addEventListener('resize', handleResize);
    }
    let lastTime = 0;
    let frameHandle = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function draw(currentTime) {
        // Throttle to ~30fps
        if (currentTime - lastTime < 33) {
            frameHandle = requestAnimationFrame(draw);
            return;
        }
        lastTime = currentTime;
        ctx.clearRect(0, 0, lockedWidth, lockedHeight);
        ctx.font = 'bold ' + fontSize + 'px monospace';
        for (let i = 0; i < streams.length; i++) {
            const stream = streams[i];
            if (stream.nextRow >= 0) {
                stream.glyphs.push({
                    char: chars[Math.floor(Math.random() * chars.length)],
                    row: stream.nextRow,
                });
                if (stream.glyphs.length > trailLength) {
                    stream.glyphs.shift();
                }
            }
            const y = stream.nextRow * fontSize;
            stream.nextRow++;
            if (y > lockedHeight && Math.random() > 0.975) {
                stream.nextRow = 0;
            }
            const glyphs = stream.glyphs;
            const newest = glyphs.length - 1;
            const x = i * fontSize;
            for (let g = 0; g < glyphs.length; g++) {
                const style = glyphStyles[newest - g];
                if (!style) {
                    continue;
                }
                ctx.fillStyle = style;
                ctx.fillText(glyphs[g].char, x, glyphs[g].row * fontSize);
            }
        }
        frameHandle = requestAnimationFrame(draw);
    }
    function startDrawing() {
        if (frameHandle !== null || reducedMotion.matches) {
            return;
        }
        frameHandle = requestAnimationFrame(draw);
    }
    function stopDrawing() {
        if (frameHandle === null) {
            return;
        }
        cancelAnimationFrame(frameHandle);
        frameHandle = null;
    }
    reducedMotion.addEventListener('change', function () {
        if (reducedMotion.matches) {
            stopDrawing();
            return;
        }
        startDrawing();
    });
    startDrawing();
});
