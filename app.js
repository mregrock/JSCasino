function appOnlineCasino(containerId, params = {}) {
    let balance = params.initialBalance || 1000;
    let currentBet = params.initialBet || 10;
    let isSpinning = false;
    let autoPlayActive = false;
    let activePaylines = params.initialPaylines || 1;
    
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
    
    let spinButton;
    let autoPlayButton;
    let maxBetButton;
    let increaseBetButton;
    let decreaseBetButton;
    let buyBonusButton;
    let betAmountDisplay;
    let balanceDisplay;
    let winAmountDisplay;
    let reels;
    let slotMachineSelect;
    let activeLinesCountDisplay;
    
    function createAppStructure() {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Контейнер с ID ${containerId} не найден`);
            return false;
        }
        
        const casinoContainer = document.createElement('div');
        casinoContainer.className = 'casino-container';
        
        casinoContainer.innerHTML = `
            <div class="slot-selector">
                <select id="${containerId}-slotMachineSelect">
                    <option value="classic">Классический автомат</option>
                    <option value="fruits">Фруктовый автомат</option>
                    <option value="egypt">Египетский автомат</option>
                </select>
            </div>
            
            <div class="slot-title">Барабаны игрового слота</div>
            
            <div class="slot-machine">
                <div class="reels-container">
                    <div class="reel" id="${containerId}-reel1">
                    </div>
                    <div class="reel" id="${containerId}-reel2">
                    </div>
                    <div class="reel" id="${containerId}-reel3">
                    </div>
                    <div class="reel" id="${containerId}-reel4">
                    </div>
                    <div class="reel" id="${containerId}-reel5">
                    </div>
                </div>
                
                <div class="paylines-info">
                    <div class="payline-indicator">Линии: 
                        <span id="${containerId}-activeLinesCount">1</span>
                    </div>
                </div>
            </div>
            
            <div class="bottom-panel">
                <div class="bonus-button">
                    <button id="${containerId}-buyBonusButton">Купить бонусной игру</button>
                </div>
                <div class="settings-panel">
                    <button id="${containerId}-settingsButton">Настройки</button>
                    <button id="${containerId}-soundButton">Звук</button>
                    <button id="${containerId}-instructionButton">Инструкция</button>
                </div>
            </div>
            
            <div class="control-panel">
                <div class="bet-controls">
                    <button id="${containerId}-decreaseBet">-</button>
                    <span>Ставка монеты</span>
                    <button id="${containerId}-increaseBet">+</button>
                </div>
                <div class="bet-amount">
                    <span>Ставка в деньгах:</span>
                    <span id="${containerId}-betAmount">10</span>
                </div>
                <div class="max-bet">
                    <button id="${containerId}-maxBetButton">Макс. ставка</button>
                </div>
                <div class="play-button">
                    <button id="${containerId}-spinButton">Кнопка игры</button>
                </div>
                <div class="auto-play">
                    <button id="${containerId}-autoPlayButton">Автоповтор</button>
                </div>
                <div class="win-display">
                    <span>Выигрыш:</span>
                    <span id="${containerId}-winAmount">0</span>
                </div>
                <div class="balance-display">
                    <span>Текущий баланс:</span>
                    <span id="${containerId}-balance">1000</span>
                </div>
            </div>
        `;
        
        container.appendChild(casinoContainer);
        
        if (params.cssPath) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = params.cssPath;
            document.head.appendChild(linkElement);
        }
        
        return true;
    }
    
    function getDOMElements() {
        spinButton = document.getElementById(`${containerId}-spinButton`);
        autoPlayButton = document.getElementById(`${containerId}-autoPlayButton`);
        maxBetButton = document.getElementById(`${containerId}-maxBetButton`);
        increaseBetButton = document.getElementById(`${containerId}-increaseBet`);
        decreaseBetButton = document.getElementById(`${containerId}-decreaseBet`);
        buyBonusButton = document.getElementById(`${containerId}-buyBonusButton`);
        betAmountDisplay = document.getElementById(`${containerId}-betAmount`);
        balanceDisplay = document.getElementById(`${containerId}-balance`);
        winAmountDisplay = document.getElementById(`${containerId}-winAmount`);
        reels = document.querySelectorAll(`#${containerId} .reel`);
        slotMachineSelect = document.getElementById(`${containerId}-slotMachineSelect`);
        activeLinesCountDisplay = document.getElementById(`${containerId}-activeLinesCount`);
    }
    
    function loadDataFromStorage() {
        const savedData = localStorage.getItem(`onlineCasino-${containerId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                balance = data.balance || balance;
                currentBet = data.currentBet || currentBet;
                activePaylines = data.activePaylines || activePaylines;
            } catch (e) {
                console.error('Ошибка при загрузке данных из localStorage:', e);
            }
        }
    }
    
    function saveDataToStorage() {
        const dataToSave = {
            balance,
            currentBet,
            activePaylines
        };
        localStorage.setItem(`onlineCasino-${containerId}`, JSON.stringify(dataToSave));
    }
    
    function updateDisplays() {
        betAmountDisplay.textContent = currentBet;
        balanceDisplay.textContent = balance;
        activeLinesCountDisplay.textContent = activePaylines;
        
        saveDataToStorage();
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
    
    function loadDataFromJSON(jsonPath) {
        if (!jsonPath) return;
        
        fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
                if (data.symbols) {
                    symbols.length = 0;
                    data.symbols.forEach(symbol => symbols.push(symbol));
                }
                
                if (data.payoutRates) {
                    Object.assign(payoutRates, data.payoutRates);
                }
                
                if (data.initialBalance) {
                    balance = data.initialBalance;
                }
                
                updateDisplays();
                populateReels();
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных из JSON:', error);
            });
    }

    function initGame() {
        if (!createAppStructure()) {
            return;
        }
        
        getDOMElements();
        
        loadDataFromStorage();
        
        if (params.jsonPath) {
            loadDataFromJSON(params.jsonPath);
        }
        
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

    initGame();
    
    return {
        startSlotMachine,
        changeBet,
        setMaxBet,
        toggleAutoPlay,
        buyBonusGame,
        changeSlotMachine
    };
} 