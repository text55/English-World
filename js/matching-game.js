// Игра "Найди пару": сопоставь английское слово с переводом.

const WORD_CATEGORIES = {
    general: {
        name: "Общая лексика",
        pairs: [
            ["friend", "друг"],
            ["house", "дом"],
            ["water", "вода"],
            ["family", "семья"],
            ["work", "работа"],
            ["book", "книга"],
            ["school", "школа"],
            ["food", "еда"],
            ["city", "город"],
            ["morning", "утро"],
        ],
    },
    verbs: {
        name: "Глаголы",
        pairs: [
            ["to go", "идти"],
            ["to see", "видеть"],
            ["to speak", "говорить"],
            ["to learn", "учить"],
            ["to write", "писать"],
            ["to read", "читать"],
            ["to eat", "есть"],
            ["to sleep", "спать"],
            ["to help", "помогать"],
            ["to think", "думать"],
        ],
    },
    time: {
        name: "Время и даты",
        pairs: [
            ["Monday", "понедельник"],
            ["today", "сегодня"],
            ["tomorrow", "завтра"],
            ["yesterday", "вчера"],
            ["week", "неделя"],
            ["month", "месяц"],
            ["year", "год"],
            ["hour", "час"],
        ],
    },
    adjectives: {
        name: "Прилагательные",
        pairs: [
            ["happy", "счастливый"],
            ["fast", "быстрый"],
            ["difficult", "сложный"],
            ["beautiful", "красивый"],
            ["strong", "сильный"],
            ["cold", "холодный"],
            ["important", "важный"],
            ["easy", "лёгкий"],
        ],
    },
};

const CARDS_PER_ROUND = 8;

const boardEl = document.getElementById('game-board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const foundEl = document.getElementById('found');
const totalEl = document.getElementById('total');
const bestTimeEl = document.getElementById('best-time');
const resultEl = document.getElementById('game-result');
const resultTextEl = document.getElementById('result-text');
const categorySelect = document.getElementById('category-select');
const restartButton = document.getElementById('restart-button');
const playAgainButton = document.getElementById('play-again-button');

let state = {
    selectedCard: null,
    moves: 0,
    found: 0,
    total: 0,
    timerInterval: null,
    seconds: 0,
    started: false,
    locked: false,
};

function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function bestTimeKey(categoryKey) {
    return `matchGameBest_${categoryKey}`;
}

function updateBestTimeDisplay(categoryKey) {
    const saved = localStorage.getItem(bestTimeKey(categoryKey));
    bestTimeEl.textContent = saved ? formatTime(Number(saved)) : '—';
}

function populateCategories() {
    Object.keys(WORD_CATEGORIES).forEach((key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = WORD_CATEGORIES[key].name;
        categorySelect.appendChild(opt);
    });
}

function startGame() {
    clearInterval(state.timerInterval);
    state = {
        selectedCard: null,
        moves: 0,
        found: 0,
        total: 0,
        timerInterval: null,
        seconds: 0,
        started: false,
        locked: false,
    };
    resultEl.classList.add('hidden');
    movesEl.textContent = '0';
    timerEl.textContent = '00:00';

    const categoryKey = categorySelect.value;
    const category = WORD_CATEGORIES[categoryKey];
    updateBestTimeDisplay(categoryKey);

    const chosenPairs = shuffle(category.pairs).slice(0, Math.min(CARDS_PER_ROUND, category.pairs.length));
    state.total = chosenPairs.length;
    totalEl.textContent = String(state.total);
    foundEl.textContent = '0';

    const englishOrder = shuffle(chosenPairs.map((pair, idx) => ({ text: pair[0], pairId: idx })));
    const russianOrder = shuffle(chosenPairs.map((pair, idx) => ({ text: pair[1], pairId: idx })));

    boardEl.innerHTML = '';
    for (let i = 0; i < chosenPairs.length; i++) {
        boardEl.appendChild(createCard(englishOrder[i], 'en'));
        boardEl.appendChild(createCard(russianOrder[i], 'ru'));
    }
}

function createCard(item, lang) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.textContent = item.text;
    card.dataset.pairId = String(item.pairId);
    card.dataset.lang = lang;
    card.addEventListener('click', () => handleCardClick(card));
    return card;
}

function startTimerIfNeeded() {
    if (state.started) return;
    state.started = true;
    state.timerInterval = setInterval(() => {
        state.seconds++;
        timerEl.textContent = formatTime(state.seconds);
    }, 1000);
}

function handleCardClick(card) {
    if (state.locked) return;
    if (card.classList.contains('matched')) return;
    if (card === state.selectedCard) return;

    startTimerIfNeeded();

    if (!state.selectedCard) {
        card.classList.add('selected');
        state.selectedCard = card;
        return;
    }

    if (state.selectedCard.dataset.lang === card.dataset.lang) {
        state.selectedCard.classList.remove('selected');
        card.classList.add('selected');
        state.selectedCard = card;
        return;
    }

    // Разные языки — проверяем совпадение пары
    state.moves++;
    movesEl.textContent = String(state.moves);
    card.classList.add('selected');

    const first = state.selectedCard;
    const second = card;

    if (first.dataset.pairId === second.dataset.pairId) {
        first.classList.remove('selected');
        second.classList.remove('selected');
        first.classList.add('matched');
        second.classList.add('matched');
        state.selectedCard = null;
        state.found++;
        foundEl.textContent = String(state.found);

        if (state.found === state.total) {
            finishGame();
        }
    } else {
        state.locked = true;
        first.classList.add('wrong');
        second.classList.add('wrong');
        setTimeout(() => {
            first.classList.remove('selected', 'wrong');
            second.classList.remove('selected', 'wrong');
            state.selectedCard = null;
            state.locked = false;
        }, 500);
    }
}

function finishGame() {
    clearInterval(state.timerInterval);
    const categoryKey = categorySelect.value;
    const key = bestTimeKey(categoryKey);
    const previousBest = localStorage.getItem(key);
    let isNewBest = false;
    if (!previousBest || state.seconds < Number(previousBest)) {
        localStorage.setItem(key, String(state.seconds));
        isNewBest = true;
    }
    updateBestTimeDisplay(categoryKey);

    resultTextEl.textContent = `Готово! Время: ${formatTime(state.seconds)}, ходов: ${state.moves}.` +
        (isNewBest ? ' Это новый рекорд! 🎉' : '');
    resultEl.classList.remove('hidden');
}

populateCategories();
startGame();

restartButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
categorySelect.addEventListener('change', startGame);
