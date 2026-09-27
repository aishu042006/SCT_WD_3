/**
 * TIC-TAC-TOE GAME ENGINE
 * Vanilla JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // CONSTANTS & CONFIGURATION
  // ==========================================================================

  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const STORAGE_KEYS = {
    THEME: 'ttt_theme',
    SOUND: 'ttt_sound'
  };

  // ==========================================================================
  // GAME STATE
  // ==========================================================================

  const state = {
    gameMode: 'pvp', // 'pvp' or 'pvc'
    difficulty: 'easy', // 'easy' or 'hard'
    player1: { name: 'Player 1', symbol: 'X' },
    player2: { name: 'Player 2', symbol: 'O', isComputer: false },
    board: Array(9).fill(null),
    currentPlayerSymbol: 'X',
    scores: { p1: 0, p2: 0, draws: 0 },
    isGameOver: false,
    isThinking: false,
    soundEnabled: true,
    darkTheme: false,
    pvpP1SymbolChoice: 'X',
    pvcP1SymbolChoice: 'X'
  };

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================

  const DOM = {
    // Header
    soundToggle: document.getElementById('sound-toggle'),
    soundOnIcon: document.querySelector('.sound-on-icon'),
    soundOffIcon: document.querySelector('.sound-off-icon'),
    themeToggle: document.getElementById('theme-toggle'),
    sunIcon: document.querySelector('.sun-icon'),
    moonIcon: document.querySelector('.moon-icon'),

    // Screens
    screens: {
      modeSelect: document.getElementById('screen-mode-select'),
      difficultySelect: document.getElementById('screen-difficulty-select'),
      pvpSetup: document.getElementById('screen-pvp-setup'),
      pvcSetup: document.getElementById('screen-pvc-setup'),
      game: document.getElementById('screen-game')
    },

    // Mode selection buttons
    btnModePvp: document.getElementById('btn-mode-pvp'),
    btnModePvc: document.getElementById('btn-mode-pvc'),

    // Difficulty selection buttons
    btnDiffEasy: document.getElementById('btn-diff-easy'),
    btnDiffHard: document.getElementById('btn-diff-hard'),
    btnDiffBack: document.getElementById('btn-diff-back'),

    // PVP Setup Form
    pvpForm: document.getElementById('pvp-setup-form'),
    pvpP1Name: document.getElementById('pvp-p1-name'),
    pvpP2Name: document.getElementById('pvp-p2-name'),
    pvpSymbolPicker: document.getElementById('pvp-symbol-picker'),
    pvpSymbolNote: document.getElementById('pvp-symbol-note'),
    btnPvpBack: document.getElementById('btn-pvp-back'),

    // PVC Setup Form
    pvcForm: document.getElementById('pvc-setup-form'),
    pvcP1Name: document.getElementById('pvc-p1-name'),
    pvcSymbolPicker: document.getElementById('pvc-symbol-picker'),
    pvcSymbolNote: document.getElementById('pvc-symbol-note'),
    pvcDiffBadge: document.getElementById('pvc-diff-badge'),
    btnPvcBack: document.getElementById('btn-pvc-back'),

    // Game screen controls
    btnChangeMode: document.getElementById('btn-change-mode'),
    btnNewGame: document.getElementById('btn-new-game'),
    btnResetScores: document.getElementById('btn-reset-scores'),

    // Scoreboard
    scoreP1Card: document.getElementById('score-p1-card'),
    scoreP2Card: document.getElementById('score-p2-card'),
    scoreP1Name: document.getElementById('score-p1-name'),
    scoreP1Symbol: document.getElementById('score-p1-symbol'),
    scoreP1Val: document.getElementById('score-p1-val'),
    scoreP2Name: document.getElementById('score-p2-name'),
    scoreP2Symbol: document.getElementById('score-p2-symbol'),
    scoreP2Val: document.getElementById('score-p2-val'),
    scoreDrawsVal: document.getElementById('score-draws-val'),

    // Turn Indicator & Board
    turnIndicator: document.getElementById('turn-indicator'),
    turnText: document.getElementById('turn-text'),
    thinkingSpinner: document.getElementById('thinking-spinner'),
    board: document.getElementById('board'),
    cells: document.querySelectorAll('.cell'),

    // Modals
    modalResult: document.getElementById('modal-result'),
    resultHeader: document.getElementById('result-header'),
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    btnResultAgain: document.getElementById('btn-result-again'),
    btnResultMode: document.getElementById('btn-result-mode'),

    modalConfirmReset: document.getElementById('modal-confirm-reset'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmReset: document.getElementById('btn-confirm-reset')
  };

  // ==========================================================================
  // WEB AUDIO SYNTHESIZER
  // ==========================================================================

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;

      if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'moveX') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'moveO') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.08); // F4
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'compMove') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const startTime = now + idx * 0.08;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.2);
        });
      } else if (type === 'lose') {
        const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const startTime = now + idx * 0.1;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
      } else if (type === 'draw') {
        const notes = [440, 440];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const startTime = now + idx * 0.12;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.1);
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // ==========================================================================
  // NAVIGATION & SCREEN MANAGEMENT
  // ==========================================================================

  function showScreen(targetScreenName) {
    Object.keys(DOM.screens).forEach((name) => {
      if (name === targetScreenName) {
        DOM.screens[name].classList.remove('hidden');
        DOM.screens[name].classList.add('active');
      } else {
        DOM.screens[name].classList.add('hidden');
        DOM.screens[name].classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // THEME & SOUND TOGGLES
  // ==========================================================================

  function initPreferences() {
    // Theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark') {
      state.darkTheme = true;
    } else if (savedTheme === 'light') {
      state.darkTheme = false;
    } else {
      state.darkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();

    // Sound
    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (savedSound !== null) {
      state.soundEnabled = savedSound === 'true';
    } else {
      state.soundEnabled = true;
    }
    applySoundState();
  }

  function applyTheme() {
    if (state.darkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      DOM.sunIcon.classList.remove('hidden');
      DOM.moonIcon.classList.add('hidden');
    } else {
      document.documentElement.removeAttribute('data-theme');
      DOM.sunIcon.classList.add('hidden');
      DOM.moonIcon.classList.remove('hidden');
    }
  }

  function toggleTheme() {
    playSound('click');
    state.darkTheme = !state.darkTheme;
    localStorage.setItem(STORAGE_KEYS.THEME, state.darkTheme ? 'dark' : 'light');
    applyTheme();
  }

  function applySoundState() {
    if (state.soundEnabled) {
      DOM.soundOnIcon.classList.remove('hidden');
      DOM.soundOffIcon.classList.add('hidden');
    } else {
      DOM.soundOnIcon.classList.add('hidden');
      DOM.soundOffIcon.classList.remove('hidden');
    }
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, state.soundEnabled ? 'true' : 'false');
    applySoundState();
    if (state.soundEnabled) playSound('click');
  }

  // ==========================================================================
  // SETUP & SYMBOL SELECTION HELPERS
  // ==========================================================================

  function updatePvpSymbolNotes() {
    if (state.pvpP1SymbolChoice === 'X') {
      DOM.pvpSymbolNote.textContent = 'Player 2 will play as O';
    } else {
      DOM.pvpSymbolNote.textContent = 'Player 2 will play as X';
    }
  }

  function updatePvcSymbolNotes() {
    if (state.pvcP1SymbolChoice === 'X') {
      DOM.pvcSymbolNote.textContent = 'Computer will play as O';
    } else {
      DOM.pvcSymbolNote.textContent = 'Computer will play as X';
    }
  }

  // ==========================================================================
  // GAME INITIALIZATION & MANAGEMENT
  // ==========================================================================

  function startNewGameSession() {
    state.scores = { p1: 0, p2: 0, draws: 0 };
    updateScoreboardUI();
    startRound();
    showScreen('game');
  }

  function startRound() {
    state.board = Array(9).fill(null);
    state.isGameOver = false;
    state.isThinking = false;
    state.currentPlayerSymbol = 'X'; // X always moves first in Tic-Tac-Toe

    // Reset cell UI
    DOM.cells.forEach((cell) => {
      cell.textContent = '';
      cell.className = 'cell';
      cell.removeAttribute('disabled');
    });

    // Hide result modal
    DOM.modalResult.classList.add('hidden');

    updateTurnUI();

    // If Computer is X, Computer moves first!
    if (state.gameMode === 'pvc' && state.player2.isComputer && state.player2.symbol === 'X') {
      triggerComputerMove();
    }
  }

  function updateScoreboardUI() {
    DOM.scoreP1Name.textContent = state.player1.name;
    DOM.scoreP1Symbol.textContent = state.player1.symbol;
    DOM.scoreP1Val.textContent = state.scores.p1;

    DOM.scoreP2Name.textContent = state.player2.name;
    DOM.scoreP2Symbol.textContent = state.player2.symbol;
    DOM.scoreP2Val.textContent = state.scores.p2;

    DOM.scoreDrawsVal.textContent = state.scores.draws;
  }

  function updateTurnUI() {
    // Highlight score card of current turn player
    const isP1Turn = state.currentPlayerSymbol === state.player1.symbol;
    if (isP1Turn) {
      DOM.scoreP1Card.classList.add('active-turn');
      DOM.scoreP2Card.classList.remove('active-turn');
    } else {
      DOM.scoreP1Card.classList.remove('active-turn');
      DOM.scoreP2Card.classList.add('active-turn');
    }

    if (state.isThinking) {
      DOM.turnText.textContent = 'Computer is thinking...';
      DOM.thinkingSpinner.classList.remove('hidden');
      return;
    }

    DOM.thinkingSpinner.classList.add('hidden');

    if (state.gameMode === 'pvp') {
      const activePlayerName = isP1Turn ? state.player1.name : state.player2.name;
      DOM.turnText.textContent = `${activePlayerName}'s Turn`;
    } else {
      if (isP1Turn) {
        DOM.turnText.textContent = 'Your Turn';
      } else {
        DOM.turnText.textContent = 'Computer\'s Turn';
      }
    }
  }

  // ==========================================================================
  // MOVE HANDLING & GAME LOGIC
  // ==========================================================================

  function handleCellClick(index) {
    if (state.isGameOver || state.isThinking || state.board[index] !== null) {
      return;
    }

    // Determine current player
    const isP1 = state.currentPlayerSymbol === state.player1.symbol;
    const currentPlayer = isP1 ? state.player1 : state.player2;

    if (state.gameMode === 'pvc' && currentPlayer.isComputer) {
      return; // Not human turn
    }

    makeMove(index, state.currentPlayerSymbol);
  }

  function makeMove(index, symbol) {
    state.board[index] = symbol;

    const cell = DOM.cells[index];
    cell.textContent = symbol;
    cell.classList.add(symbol.toLowerCase(), 'cell-pop');

    playSound(symbol === 'X' ? 'moveX' : 'moveO');

    const winnerInfo = checkWinner(state.board);

    if (winnerInfo) {
      handleGameOver(winnerInfo);
    } else {
      // Switch turn
      state.currentPlayerSymbol = state.currentPlayerSymbol === 'X' ? 'O' : 'X';
      updateTurnUI();

      // Check if next turn is Computer
      const isNextP1 = state.currentPlayerSymbol === state.player1.symbol;
      const nextPlayer = isNextP1 ? state.player1 : state.player2;

      if (state.gameMode === 'pvc' && nextPlayer.isComputer && !state.isGameOver) {
        triggerComputerMove();
      }
    }
  }

  // ==========================================================================
  // WIN / DRAW DETECTION
  // ==========================================================================

  function checkWinner(boardState) {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winnerSymbol: boardState[a], winningCombo: combo, isDraw: false };
      }
    }

    const isFull = boardState.every((cell) => cell !== null);
    if (isFull) {
      return { winnerSymbol: null, winningCombo: null, isDraw: true };
    }

    return null;
  }

  function handleGameOver(result) {
    state.isGameOver = true;
    DOM.thinkingSpinner.classList.add('hidden');

    if (result.isDraw) {
      state.scores.draws++;
      updateScoreboardUI();
      playSound('draw');
      showResultModal({
        header: "IT'S A DRAW",
        title: 'No winner this round.',
        scoreText: `Score: ${state.scores.p1} : ${state.scores.p2}`
      });
    } else {
      // Highlight winning cells
      result.winningCombo.forEach((idx) => {
        DOM.cells[idx].classList.add('winning');
      });

      const isP1Winner = result.winnerSymbol === state.player1.symbol;
      let winnerName = isP1Winner ? state.player1.name : state.player2.name;

      if (isP1Winner) {
        state.scores.p1++;
      } else {
        state.scores.p2++;
      }

      updateScoreboardUI();

      if (state.gameMode === 'pvp') {
        playSound('win');
        showResultModal({
          header: 'ROUND WON',
          title: `${winnerName} wins!`,
          scoreText: `Score: ${state.scores.p1} : ${state.scores.p2}`
        });
      } else {
        // PVC Mode
        if (isP1Winner) {
          playSound('win');
          showResultModal({
            header: 'YOU WON',
            title: `${winnerName} wins!`,
            scoreText: `Score: ${state.scores.p1} : ${state.scores.p2}`
          });
        } else {
          playSound('lose');
          showResultModal({
            header: 'GAME OVER',
            title: 'COMPUTER WINS',
            scoreText: `Score: ${state.scores.p1} : ${state.scores.p2}`
          });
        }
      }
    }
  }

  function showResultModal({ header, title, scoreText }) {
    DOM.resultHeader.textContent = header;
    DOM.resultTitle.textContent = title;
    DOM.resultScore.textContent = scoreText;

    // Small delay before showing modal so player sees the winning line animation
    setTimeout(() => {
      DOM.modalResult.classList.remove('hidden');
    }, 600);
  }

  // ==========================================================================
  // COMPUTER AI LOGIC (EASY & UNBEATABLE MINIMAX)
  // ==========================================================================

  function triggerComputerMove() {
    state.isThinking = true;
    updateTurnUI();

    // Natural delay for thinking
    const thinkingDelay = Math.floor(Math.random() * 200) + 450; // 450ms - 650ms

    setTimeout(() => {
      if (state.isGameOver) return;

      const compSymbol = state.player2.symbol;
      const humanSymbol = state.player1.symbol;
      let moveIndex = -1;

      if (state.difficulty === 'easy') {
        moveIndex = getEasyMove(state.board, compSymbol, humanSymbol);
      } else {
        moveIndex = getBestMoveMinimax(state.board, compSymbol, humanSymbol);
      }

      state.isThinking = false;
      if (moveIndex !== -1 && state.board[moveIndex] === null) {
        makeMove(moveIndex, compSymbol);
      }
    }, thinkingDelay);
  }

  function getEasyMove(boardState, compSymbol, humanSymbol) {
    const emptyIndices = [];
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === null) emptyIndices.push(i);
    }

    if (emptyIndices.length === 0) return -1;

    // Easy computer: 30% chance to block or win if available, otherwise random
    const shouldTryWinBlock = Math.random() < 0.3;
    if (shouldTryWinBlock) {
      // Check if computer can win in 1 move
      for (const idx of emptyIndices) {
        boardState[idx] = compSymbol;
        if (checkWinner(boardState)?.winnerSymbol === compSymbol) {
          boardState[idx] = null;
          return idx;
        }
        boardState[idx] = null;
      }
      // Check if human is about to win and block
      for (const idx of emptyIndices) {
        boardState[idx] = humanSymbol;
        if (checkWinner(boardState)?.winnerSymbol === humanSymbol) {
          boardState[idx] = null;
          return idx;
        }
        boardState[idx] = null;
      }
    }

    // Pick random empty cell
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
  }

  function getBestMoveMinimax(boardState, compSymbol, humanSymbol) {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (boardState[i] === null) {
        boardState[i] = compSymbol;
        let score = minimax(boardState, 0, false, compSymbol, humanSymbol);
        boardState[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  function minimax(boardState, depth, isMaximizing, compSymbol, humanSymbol) {
    const result = checkWinner(boardState);
    if (result) {
      if (result.winnerSymbol === compSymbol) return 10 - depth;
      if (result.winnerSymbol === humanSymbol) return depth - 10;
      if (result.isDraw) return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = compSymbol;
          let score = minimax(boardState, depth + 1, false, compSymbol, humanSymbol);
          boardState[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = humanSymbol;
          let score = minimax(boardState, depth + 1, true, compSymbol, humanSymbol);
          boardState[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================

  function bindEventListeners() {
    // Header toggles
    DOM.soundToggle.addEventListener('click', toggleSound);
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // Mode Selection Screen
    DOM.btnModePvp.addEventListener('click', () => {
      playSound('click');
      state.gameMode = 'pvp';
      showScreen('pvpSetup');
    });

    DOM.btnModePvc.addEventListener('click', () => {
      playSound('click');
      state.gameMode = 'pvc';
      showScreen('difficultySelect');
    });

    // Difficulty Selection Screen
    DOM.btnDiffEasy.addEventListener('click', () => {
      playSound('click');
      state.difficulty = 'easy';
      DOM.pvcDiffBadge.textContent = 'Difficulty: EASY';
      showScreen('pvcSetup');
    });

    DOM.btnDiffHard.addEventListener('click', () => {
      playSound('click');
      state.difficulty = 'hard';
      DOM.pvcDiffBadge.textContent = 'Difficulty: HARD';
      showScreen('pvcSetup');
    });

    DOM.btnDiffBack.addEventListener('click', () => {
      playSound('click');
      showScreen('modeSelect');
    });

    // PVP Setup Form
    DOM.pvpSymbolPicker.querySelectorAll('.symbol-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        playSound('click');
        DOM.pvpSymbolPicker.querySelectorAll('.symbol-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.pvpP1SymbolChoice = btn.getAttribute('data-symbol');
        updatePvpSymbolNotes();
      });
    });

    DOM.btnPvpBack.addEventListener('click', () => {
      playSound('click');
      showScreen('modeSelect');
    });

    DOM.pvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('click');
      const p1Name = DOM.pvpP1Name.value.trim() || 'Player 1';
      const p2Name = DOM.pvpP2Name.value.trim() || 'Player 2';
      const p1Sym = state.pvpP1SymbolChoice;
      const p2Sym = p1Sym === 'X' ? 'O' : 'X';

      state.player1 = { name: p1Name, symbol: p1Sym };
      state.player2 = { name: p2Name, symbol: p2Sym, isComputer: false };

      startNewGameSession();
    });

    // PVC Setup Form
    DOM.pvcSymbolPicker.querySelectorAll('.symbol-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        playSound('click');
        DOM.pvcSymbolPicker.querySelectorAll('.symbol-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.pvcP1SymbolChoice = btn.getAttribute('data-symbol');
        updatePvcSymbolNotes();
      });
    });

    DOM.btnPvcBack.addEventListener('click', () => {
      playSound('click');
      showScreen('difficultySelect');
    });

    DOM.pvcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('click');
      const p1Name = DOM.pvcP1Name.value.trim() || 'Player';
      const p1Sym = state.pvcP1SymbolChoice;
      const compSym = p1Sym === 'X' ? 'O' : 'X';

      state.player1 = { name: p1Name, symbol: p1Sym };
      state.player2 = { name: 'Computer', symbol: compSym, isComputer: true };

      startNewGameSession();
    });

    // Game Control Buttons
    DOM.btnChangeMode.addEventListener('click', () => {
      playSound('click');
      showScreen('modeSelect');
    });

    DOM.btnNewGame.addEventListener('click', () => {
      playSound('click');
      startRound();
    });

    DOM.btnResetScores.addEventListener('click', () => {
      playSound('click');
      DOM.modalConfirmReset.classList.remove('hidden');
    });

    // Board Cell Clicks
    DOM.cells.forEach((cell) => {
      cell.addEventListener('click', () => {
        const index = parseInt(cell.getAttribute('data-index'), 10);
        handleCellClick(index);
      });
    });

    // Result Modal Buttons
    DOM.btnResultAgain.addEventListener('click', () => {
      playSound('click');
      startRound();
    });

    DOM.btnResultMode.addEventListener('click', () => {
      playSound('click');
      DOM.modalResult.classList.add('hidden');
      showScreen('modeSelect');
    });

    // Confirm Reset Modal Buttons
    DOM.btnConfirmCancel.addEventListener('click', () => {
      playSound('click');
      DOM.modalConfirmReset.classList.add('hidden');
    });

    DOM.btnConfirmReset.addEventListener('click', () => {
      playSound('click');
      state.scores = { p1: 0, p2: 0, draws: 0 };
      updateScoreboardUI();
      DOM.modalConfirmReset.classList.add('hidden');
    });
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  initPreferences();
  bindEventListeners();
  updatePvpSymbolNotes();
  updatePvcSymbolNotes();
  showScreen('modeSelect');
});
