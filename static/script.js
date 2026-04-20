async function loadVocab() {
    const [vocabRes, embedRes] = await Promise.all([
        fetch('/vocab'),
        fetch('/embed')
    ]);
    const vocab = await vocabRes.json();
    const embeddings = await embedRes.json();

    const container = document.getElementById('vocab-container');

    for (const [word, index] of Object.entries(vocab)) {
        const vector = embeddings[index];

        const row = document.createElement('div');
        row.className = 'vocab-row';

        const wordEl = document.createElement('div');
        wordEl.className = 'vocab-word';
        wordEl.textContent = word === ' ' ? '␣' : word;

        const arrow1 = document.createElement('div');
        arrow1.className = 'vocab-arrow';
        arrow1.textContent = '→';

        const indexEl = document.createElement('div');
        indexEl.className = 'vocab-index';
        indexEl.textContent = index;

        const arrow2 = document.createElement('div');
        arrow2.className = 'vocab-arrow';
        arrow2.textContent = '→';

        const vectorEl = document.createElement('div');
        vectorEl.className = 'vocab-vector';
        vectorEl.textContent = `[${vector[0].toFixed(3)}, ${vector[1].toFixed(3)}]`;

        row.append(wordEl, arrow1, indexEl, arrow2, vectorEl);
        container.appendChild(row);
    }

    drawPlot(vocab, embeddings);
}

function drawPlot(vocab, embeddings) {
    const svg = document.getElementById('embed-plot');
    const svgNS = 'http://www.w3.org/2000/svg';

    const points = Object.entries(vocab).map(([word, index]) => ({
        word: word === ' ' ? '␣' : word,
        x: embeddings[index][0],
        y: embeddings[index][1]
    }));

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const rawMinX = Math.min(...xs, 0), rawMaxX = Math.max(...xs, 0);
    const rawMinY = Math.min(...ys, 0), rawMaxY = Math.max(...ys, 0);
    const padX = (rawMaxX - rawMinX) * 0.15 || 1;
    const padY = (rawMaxY - rawMinY) * 0.15 || 1;
    const minX = rawMinX - padX, maxX = rawMaxX + padX;
    const minY = rawMinY - padY, maxY = rawMaxY + padY;

    const plotSize = 200;
    const scaleX = v => ((v - minX) / (maxX - minX)) * plotSize;
    const scaleY = v => plotSize - ((v - minY) / (maxY - minY)) * plotSize;

    const originX = scaleX(0);
    const originY = scaleY(0);

    const makeAxis = (x1, y1, x2, y2, markerEnd) => {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#a8b2d1');
        line.setAttribute('stroke-width', '0.6');
        if (markerEnd) line.setAttribute('marker-end', markerEnd);
        svg.appendChild(line);
    };

    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS(svgNS, 'defs');
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '8');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '4');
        marker.setAttribute('markerHeight', '4');
        marker.setAttribute('orient', 'auto');
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M0,0 L10,5 L0,10 z');
        path.setAttribute('fill', '#a8b2d1');
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }

    makeAxis(0, originY, plotSize, originY, 'url(#arrowhead)');
    makeAxis(originX, plotSize, originX, 0, 'url(#arrowhead)');

    for (const p of points) {
        const cx = scaleX(p.x);
        const cy = scaleY(p.y);

        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', '2');
        circle.setAttribute('fill', '#e94560');
        svg.appendChild(circle);

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', cx + 3);
        label.setAttribute('y', cy - 3);
        label.setAttribute('fill', '#a8b2d1');
        label.setAttribute('font-size', '5');
        label.textContent = p.word;
        svg.appendChild(label);
    }
}

loadVocab();

document.getElementById('encode-btn').addEventListener('click', async () => {
    const text = document.getElementById('encode-input').value;
    const res = await fetch('/encode?text=' + encodeURIComponent(text));
    const encoding = await res.json();
    document.getElementById('encode-result').textContent = JSON.stringify(encoding);
});
