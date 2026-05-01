async function loadVocab() {
    const res = await fetch('/vocab_lookup');
    const lookup = await res.json();
    const entries = Object.values(lookup);

    renderCards(entries, {
        containerId: 'vocab-container',
        getTitle: e => e.char === ' ' ? '␣' : e.char,
        getSubtitle: e => `index: ${e.index}`,
    });
    renderPlot(entries, {
        svgId: 'embedding-plot',
        getLabel: e => e.char === ' ' ? '␣' : e.char,
    });
}

async function loadPositions() {
    const res = await fetch('/position_lookup');
    const lookup = await res.json();
    const entries = Object.values(lookup);

    renderCards(entries, {
        containerId: 'position-container',
        getTitle: e => e.position,
        getSubtitle: e => `position: ${e.position}`,
    });
    renderPlot(entries, {
        svgId: 'position-plot',
        getLabel: e => e.position,
    });
}

function renderCards(entries, { containerId, getTitle, getSubtitle }) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (const entry of entries) {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        const wordEl = document.createElement('div');
        wordEl.className = 'vocab-word';
        wordEl.textContent = getTitle(entry);

        const indexEl = document.createElement('div');
        indexEl.className = 'vocab-index';
        indexEl.textContent = getSubtitle(entry);

        const embedEl = document.createElement('div');
        embedEl.className = 'vocab-embedding';
        const [x, y] = entry.embedding;
        embedEl.textContent = `[${x.toFixed(3)}, ${y.toFixed(3)}]`;

        card.append(wordEl, indexEl, embedEl);
        container.appendChild(card);
    }
}

function renderPlot(entries, { svgId, getLabel }) {
    const svg = document.getElementById(svgId);
    const W = 600, H = 600, PAD = 40;
    svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';

    const xs = entries.map(e => e.embedding[0]);
    const ys = entries.map(e => e.embedding[1]);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const xPad = (xMax - xMin) * 0.1 || 1;
    const yPad = (yMax - yMin) * 0.1 || 1;
    const xLo = xMin - xPad, xHi = xMax + xPad;
    const yLo = yMin - yPad, yHi = yMax + yPad;

    const sx = v => PAD + (v - xLo) / (xHi - xLo) * (W - 2 * PAD);
    const sy = v => H - PAD - (v - yLo) / (yHi - yLo) * (H - 2 * PAD);

    // axes through origin (if visible)
    const axis = (x1, y1, x2, y2) => {
        const l = document.createElementNS(ns, 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        l.setAttribute('stroke', '#5c6b8a');
        l.setAttribute('stroke-width', '1');
        l.setAttribute('stroke-dasharray', '4,4');
        svg.appendChild(l);
    };
    if (xLo <= 0 && xHi >= 0) axis(sx(0), PAD, sx(0), H - PAD);
    if (yLo <= 0 && yHi >= 0) axis(PAD, sy(0), W - PAD, sy(0));

    // bounding box
    const box = document.createElementNS(ns, 'rect');
    box.setAttribute('x', PAD); box.setAttribute('y', PAD);
    box.setAttribute('width', W - 2 * PAD); box.setAttribute('height', H - 2 * PAD);
    box.setAttribute('fill', 'none');
    box.setAttribute('stroke', '#0f3460');
    svg.appendChild(box);

    for (const entry of entries) {
        const [x, y] = entry.embedding;
        const cx = sx(x), cy = sy(y);

        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
        dot.setAttribute('r', '5');
        dot.setAttribute('fill', '#e94560');
        svg.appendChild(dot);

        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', cx + 8); label.setAttribute('y', cy - 6);
        label.setAttribute('fill', '#e0e0e0');
        label.setAttribute('font-size', '13');
        label.setAttribute('font-family', 'monospace');
        label.textContent = getLabel(entry);
        svg.appendChild(label);
    }
}

loadVocab();
loadPositions();
