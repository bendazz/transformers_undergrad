async function loadVocab() {
    const res = await fetch('/vocab');
    const vocab = await res.json();
    const container = document.getElementById('vocab-container');

    for (const [word, index] of Object.entries(vocab)) {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        const wordEl = document.createElement('div');
        wordEl.className = 'vocab-word';
        wordEl.textContent = word === ' ' ? '␣' : word;

        const arrow = document.createElement('div');
        arrow.className = 'vocab-arrow';
        arrow.textContent = '↓';

        const indexEl = document.createElement('div');
        indexEl.className = 'vocab-index';
        indexEl.textContent = index;

        card.append(wordEl, arrow, indexEl);
        container.appendChild(card);
    }
}

loadVocab();
