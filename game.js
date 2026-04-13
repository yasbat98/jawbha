// Jawbha - Word Guessing Game Logic

const WORD_LIST = [
  'crane', 'slate', 'trace', 'audio', 'raise',
  'stare', 'arise', 'crate', 'snare', 'tales',
  'brave', 'flare', 'glare', 'grace', 'phase',
  'place', 'plane', 'plate', 'blaze', 'chase',
  'drape', 'frame', 'grade', 'grape', 'graze',
  'prize', 'prose', 'prune', 'pulse', 'purse',
  'quest', 'quote', 'raven', 'realm', 'reign',
  'rider', 'ridge', 'risky', 'rival', 'river',
  'robin', 'rocky', 'rouge', 'rough', 'round',
  'royal', 'rugby', 'ruler', 'rural', 'rusty',
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const TILE_STATE = {
  CORRECT: 'correct',   // right letter, right position
  PRESENT: 'present',   // right letter, wrong position
  ABSENT: 'absent',     // letter not in word
};

/**
 * Pick a random word from the word list.
 */
function pickRandomWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

/**
 * Evaluate a guess against the target word.
 * Returns an array of { letter, state } objects.
 */
function evaluateGuess(guess, target) {
  if (guess.length !== WORD_LENGTH) {
    throw new Error(`Guess must be ${WORD_LENGTH} letters long`);
  }
  if (target.length !== WORD_LENGTH) {
    throw new Error(`Target must be ${WORD_LENGTH} letters long`);
  }

  const result = Array(WORD_LENGTH).fill(null).map((_, i) => ({
    letter: guess[i],
    state: TILE_STATE.ABSENT,
  }));

  // Track remaining letters in the target (for PRESENT matching)
  const targetLetters = target.split('');

  // First pass: mark CORRECT
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) {
      result[i].state = TILE_STATE.CORRECT;
      targetLetters[i] = null; // consume this letter
    }
  }

  // Second pass: mark PRESENT
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].state === TILE_STATE.CORRECT) continue;
    const idx = targetLetters.indexOf(guess[i]);
    if (idx !== -1) {
      result[i].state = TILE_STATE.PRESENT;
      targetLetters[idx] = null; // consume this letter
    }
  }

  return result;
}

/**
 * Check if a guess is a valid word (in our list).
 */
function isValidWord(word) {
  return WORD_LIST.includes(word.toLowerCase());
}

/**
 * Check if all tiles in a result are CORRECT.
 */
function isWin(result) {
  return result.every(tile => tile.state === TILE_STATE.CORRECT);
}

/**
 * Create a new game state.
 */
function createGame(targetWord) {
  return {
    target: targetWord || pickRandomWord(),
    guesses: [],
    results: [],
    status: 'playing', // 'playing' | 'won' | 'lost'
  };
}

/**
 * Submit a guess to the game. Returns updated game state.
 */
function submitGuess(game, guess) {
  if (game.status !== 'playing') {
    throw new Error('Game is already over');
  }
  if (game.guesses.length >= MAX_GUESSES) {
    throw new Error('No more guesses remaining');
  }

  const normalised = guess.toLowerCase().trim();

  if (normalised.length !== WORD_LENGTH) {
    throw new Error(`Guess must be exactly ${WORD_LENGTH} letters`);
  }

  const result = evaluateGuess(normalised, game.target);
  const updatedGame = {
    ...game,
    guesses: [...game.guesses, normalised],
    results: [...game.results, result],
  };

  if (isWin(result)) {
    updatedGame.status = 'won';
  } else if (updatedGame.guesses.length >= MAX_GUESSES) {
    updatedGame.status = 'lost';
  }

  return updatedGame;
}

// Export for Node.js / testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WORD_LIST,
    MAX_GUESSES,
    WORD_LENGTH,
    TILE_STATE,
    pickRandomWord,
    evaluateGuess,
    isValidWord,
    isWin,
    createGame,
    submitGuess,
  };
}
