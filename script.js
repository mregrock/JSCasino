let balance = 1000;
let currentBet = 10;
let isSpinning = false;
let autoPlayActive = false;
let activePaylines = 1;

const symbols = [
    { symbol: '🍒', value: 10, weight: 40 },
    { symbol: '🍋', value: 20, weight: 30 },
    { symbol: '🍇', value: 30, weight: 20 },
    { symbol: '7️⃣', value: 100, weight: 5 },
    { symbol: '💎', value: 200, weight: 5 }
];

const payoutRates = {
    '3': 2,
    '4': 5,
    '5': 10
};

const paylines = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [2, 1, 1, 1, 2]
];

const spinButton = document.getElementById('spinButton');
const autoPlayButton = document.getElementById('autoPlayButton');
const maxBetButton = document.getElementById('maxBetButton');
const increaseBetButton = document.getElementById('increaseBet');
const decreaseBetButton = document.getElementById('decreaseBet');
const buyBonusButton = document.getElementById('buyBonusButton');
const betAmountDisplay = document.getElementById('betAmount');
const balanceDisplay = document.getElementById('balance');
const winAmountDisplay = document.getElementById('winAmount');
const reels = document.querySelectorAll('.reel');
const slotMachineSelect = document.getElementById('slotMachineSelect');
const activeLinesCountDisplay = document.getElementById('activeLinesCount');

function updateDisplays() {
    betAmountDisplay.textContent = currentBet;
    balanceDisplay.textContent = balance;
    activeLinesCountDisplay.textContent = activePaylines;
}

function getRandomSymbol() {
    const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbolObj of symbols) {
        random -= symbolObj.weight;
        if (random <= 0) {
            return symbolObj;
        }
    }
    return symbols[0];
}

function createReelStrip() {
    const reelSymbols = [];
    for (let i = 0; i < 20; i++) {
        reelSymbols.push(getRandomSymbol());
    }
    return reelSymbols;
}

function populateReels() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        const reelContainer = document.createElement('div');
        reelContainer.className = 'reel-container';
        const reelStrip = createReelStrip();
        reelStrip.forEach(symbolObj => {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'symbol';
            symbolElement.textContent = symbolObj.symbol;
            symbolElement.dataset.value = symbolObj.value;
            reelContainer.appendChild(symbolElement);
        });
        reel.appendChild(reelContainer);
    });
}

function startSlotMachine() {
    if (balance < currentBet) {
        alert('Недостаточно средств на балансе!');
        autoPlayActive = false;
        return;
    }
    if (isSpinning) return;
    balance -= currentBet;
    updateDisplays();
    isSpinning = true;
    spinButton.disabled = true;
    winAmountDisplay.textContent = '0';
    const results = [];
    for (let i = 0; i < 5; i++) {
        results.push([
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol()
        ]);
    }
    reels.forEach((reel, reelIndex) => {
        const reelContainer = reel.querySelector('.reel-container');
        reel.classList.add('spinning');
        setTimeout(() => {
            reel.classList.remove('spinning');
            const symbols = reelContainer.querySelectorAll('.symbol');
            for (let i = 0; i < symbols.length; i++) {
                if (i < 3) {
                    symbols[i].textContent = results[reelIndex][i].symbol;
                    symbols[i].dataset.value = results[reelIndex][i].value;
                }
            }
            reelContainer.style.top = '0px';
            if (reelIndex === reels.length - 1) {
                setTimeout(() => {
                    checkResults(results);
                    isSpinning = false;
                    spinButton.disabled = false;
                    if (autoPlayActive) {
                        setTimeout(startSlotMachine, 1000);
                    }
                }, 500);
            }
        }, 1000 + reelIndex * 300);
    });
}

function checkResults(results) {
    let totalWin = 0;
    for (let lineIndex = 0; lineIndex < activePaylines; lineIndex++) {
        const payline = paylines[lineIndex];
        const lineSymbols = [];
        for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
            lineSymbols.push(results[reelIndex][payline[reelIndex]].symbol);
        }
        const symbolCounts = {};
        lineSymbols.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
        let maxCount = 0;
        let maxSymbol = null;
        for (const [symbol, count] of Object.entries(symbolCounts)) {
            if (count > maxCount) {
                maxCount = count;
                maxSymbol = symbol;
            }
        }
        if (maxCount >= 3) {
            const symbolValue = symbols.find(s => s.symbol === maxSymbol).value;
            const win = symbolValue * currentBet * payoutRates[maxCount] / activePaylines;
            totalWin += win;
            for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
                if (lineSymbols[reelIndex] === maxSymbol) {
                    const position = payline[reelIndex];
                    const reel = reels[reelIndex];
                    const symbols = reel.querySelectorAll('.symbol');
                    symbols[position].classList.add('win-highlight');
                    setTimeout(() => {
                        symbols[position].classList.remove('win-highlight');
                    }, 1500);
                }
            }
        }
    }
    if (totalWin > 0) {
        balance += totalWin;
        winAmountDisplay.textContent = totalWin.toFixed(0);
    }
    updateDisplays();
}

function changeBet(amount) {
    const newBet = currentBet + amount;
    if (newBet >= 1 && newBet <= 100) {
        currentBet = newBet;
        updateDisplays();
    }
}

function setMaxBet() {
    currentBet = 100;
    updateDisplays();
}

function toggleAutoPlay() {
    autoPlayActive = !autoPlayActive;
    if (autoPlayActive) {
        autoPlayButton.textContent = 'Стоп Авто';
        startSlotMachine();
    } else {
        autoPlayButton.textContent = 'Автоповтор';
    }
}

function buyBonusGame() {
    const bonusCost = currentBet * 100;
    if (balance >= bonusCost) {
        balance -= bonusCost;
        updateDisplays();
        alert('Бонусная игра активирована!');
        setTimeout(() => {
            const bonusWin = bonusCost * 1.5;
            balance += bonusWin;
            winAmountDisplay.textContent = bonusWin;
            updateDisplays();
            alert(`Вы выиграли ${bonusWin} в бонусной игре!`);
        }, 1000);
    } else {
        alert('Недостаточно средств для покупки бонусной игры!');
    }
}

function changeSlotMachine() {
    const selectedSlot = slotMachineSelect.value;
    switch (selectedSlot) {
        case 'fruits':
            symbols.length = 0;
            symbols.push(
                { symbol: '🍒', value: 10, weight: 40 },
                { symbol: '🍋', value: 20, weight: 30 },
                { symbol: '🍇', value: 30, weight: 20 },
                { symbol: '🍉', value: 50, weight: 10 },
                { symbol: '🍓', value: 100, weight: 5 }
            );
            break;
        case 'egypt':
            symbols.length = 0;
            symbols.push(
                { symbol: '🐫', value: 10, weight: 40 },
                { symbol: '🐪', value: 20, weight: 30 },
                { symbol: '🐍', value: 30, weight: 20 },
                { symbol: '👑', value: 50, weight: 10 },
                { symbol: '🔱', value: 100, weight: 5 }
            );
            break;
        default:
            symbols.length = 0;
            symbols.push(
                { symbol: '🍒', value: 10, weight: 40 },
                { symbol: '🍋', value: 20, weight: 30 },
                { symbol: '🍇', value: 30, weight: 20 },
                { symbol: '7️⃣', value: 100, weight: 5 },
                { symbol: '💎', value: 200, weight: 5 }
            );
    }
    populateReels();
}

function initGame() {
    updateDisplays();
    populateReels();
    spinButton.addEventListener('click', startSlotMachine);
    autoPlayButton.addEventListener('click', toggleAutoPlay);
    maxBetButton.addEventListener('click', setMaxBet);
    increaseBetButton.addEventListener('click', () => changeBet(1));
    decreaseBetButton.addEventListener('click', () => changeBet(-1));
    buyBonusButton.addEventListener('click', buyBonusGame);
    slotMachineSelect.addEventListener('change', changeSlotMachine);
}

window.addEventListener('load', initGame);