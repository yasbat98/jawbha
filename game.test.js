const {
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
} = require('./game');

// ── evaluateGuess ──────────────────────────────────────────────────────────

describe('evaluateGuess', () => {
  test('all correct letters in correct positions', () => {
    const result = evaluateGuess('crane', 'crane');
    expect(result).toHaveLength(5);
    result.forEach(tile => expect(tile.state).toBe(TILE_STATE.CORRECT));
  });

  test('all absent letters', () => {
    const result = evaluateGuess('glyph', 'crane');
    result.forEach(tile => expect(tile.state).toBe(TILE_STATE.ABSENT));
  });

  test('mixed correct, present, absent', () => {
    // target: crane  c(0) r(1) a(2) n(3) e(4)
    // guess:  trace  t(0) r(1) a(2) c(3) e(4)
    //   t(0) -> absent  (not in 'crane')
    //   r(1) -> correct (r is at position 1 in both)
    //   a(2) -> correct (a is at position 2 in both)
    //   c(3) -> present (c is in crane at pos 0, wrong position here)
    //   e(4) -> correct (e is at position 4 in both)
    const result = evaluateGuess('trace', 'crane');
    expect(result[0]).toEqual({ letter: 't', state: TILE_STATE.ABSENT });
    expect(result[1]).toEqual({ letter: 'r', state: TILE_STATE.CORRECT });
    expect(result[2]).toEqual({ letter: 'a', state: TILE_STATE.CORRECT });
    expect(result[3]).toEqual({ letter: 'c', state: TILE_STATE.PRESENT });
    expect(result[4]).toEqual({ letter: 'e', state: TILE_STATE.CORRECT });
  });

  test('duplicate letters in guess - only marks as many as exist in target', () => {
    // target: crane  c(0) r(1) a(2) n(3) e(4)
    // guess:  error  e(0) r(1) r(2) o(3) r(4)
    //   r at pos 1 -> CORRECT (r matches target pos 1, consumed)
    //   r at pos 2 -> ABSENT  (no more r's in target)
    //   r at pos 4 -> ABSENT  (no more r's in target)
    const result = evaluateGuess('error', 'crane');
    const rTiles = result.filter(t => t.letter === 'r');
    const correctCount = rTiles.filter(t => t.state === TILE_STATE.CORRECT).length;
    const absentCount  = rTiles.filter(t => t.state === TILE_STATE.ABSENT).length;
    expect(correctCount).toBe(1);
    expect(absentCount).toBe(2);
  });

  test('correct takes priority over present for same letter', () => {
    // target: abcde, guess: aaxxx
    // first 'a' is CORRECT, second 'a' is ABSENT (no more a's in target)
    const result = evaluateGuess('aaxxx', 'abcde');
    expect(result[0]).toEqual({ letter: 'a', state: TILE_STATE.CORRECT });
    expect(result[1]).toEqual({ letter: 'a', state: TILE_STATE.ABSENT });
  });

  test('throws on wrong guess length', () => {
    expect(() => evaluateGuess('hi', 'crane')).toThrow();
    expect(() => evaluateGuess('toolong', 'crane')).toThrow();
  });

  test('returns letter metadata for each position', () => {
    const result = evaluateGuess('slate', 'stale');
    expect(result[0].letter).toBe('s');
    expect(result[1].letter).toBe('l');
    expect(result[4].letter).toBe('e');
  });
});

// ── isWin ──────────────────────────────────────────────────────────────────

describe('isWin', () => {
  test('returns true when all tiles are correct', () => {
    const result = evaluateGuess('crane', 'crane');
    expect(isWin(result)).toBe(true);
  });

  test('returns false when not all tiles are correct', () => {
    const result = evaluateGuess('trace', 'crane');
    expect(isWin(result)).toBe(false);
  });
});

// ── isValidWord ────────────────────────────────────────────────────────────

describe('isValidWord', () => {
  test('accepts words in the list', () => {
    WORD_LIST.forEach(w => expect(isValidWord(w)).toBe(true));
  });

  test('rejects words not in the list', () => {
    expect(isValidWord('zzzzz')).toBe(false);
    expect(isValidWord('hello')).toBe(false);
  });

  test('is case-insensitive', () => {
    expect(isValidWord('CRANE')).toBe(true);
    expect(isValidWord('Slate')).toBe(true);
  });
});

// ── pickRandomWord ─────────────────────────────────────────────────────────

describe('pickRandomWord', () => {
  test('returns a word from the word list', () => {
    for (let i = 0; i < 20; i++) {
      expect(WORD_LIST).toContain(pickRandomWord());
    }
  });

  test('returns a 5-letter word', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickRandomWord()).toHaveLength(WORD_LENGTH);
    }
  });
});

// ── createGame ─────────────────────────────────────────────────────────────

describe('createGame', () => {
  test('initialises with empty guesses and playing status', () => {
    const game = createGame('crane');
    expect(game.target).toBe('crane');
    expect(game.guesses).toHaveLength(0);
    expect(game.results).toHaveLength(0);
    expect(game.status).toBe('playing');
  });

  test('picks a random word when no target is supplied', () => {
    const game = createGame();
    expect(WORD_LIST).toContain(game.target);
  });
});

// ── submitGuess ────────────────────────────────────────────────────────────

describe('submitGuess', () => {
  test('records guess and result', () => {
    let game = createGame('crane');
    game = submitGuess(game, 'slate');
    expect(game.guesses).toEqual(['slate']);
    expect(game.results).toHaveLength(1);
  });

  test('status becomes won on correct guess', () => {
    let game = createGame('crane');
    game = submitGuess(game, 'crane');
    expect(game.status).toBe('won');
  });

  test('status becomes lost after max wrong guesses', () => {
    let game = createGame('crane');
    const wrongGuesses = ['slate', 'audio', 'prize', 'robin', 'ruler', 'rusty'];
    wrongGuesses.forEach(g => { game = submitGuess(game, g); });
    expect(game.status).toBe('lost');
    expect(game.guesses).toHaveLength(MAX_GUESSES);
  });

  test('throws when guess is wrong length', () => {
    let game = createGame('crane');
    expect(() => submitGuess(game, 'hi')).toThrow();
  });

  test('throws when game is already over', () => {
    let game = createGame('crane');
    game = submitGuess(game, 'crane'); // win
    expect(() => submitGuess(game, 'slate')).toThrow('Game is already over');
  });

  test('does not mutate the original game state', () => {
    const game = createGame('crane');
    const updated = submitGuess(game, 'slate');
    expect(game.guesses).toHaveLength(0);
    expect(updated.guesses).toHaveLength(1);
  });

  test('accepts mixed-case input by normalising to lowercase', () => {
    let game = createGame('crane');
    game = submitGuess(game, 'CRANE');
    expect(game.status).toBe('won');
  });

  test('full winning game flow', () => {
    let game = createGame('crane');
    game = submitGuess(game, 'slate'); // wrong
    expect(game.status).toBe('playing');
    game = submitGuess(game, 'crane'); // correct
    expect(game.status).toBe('won');
    expect(game.guesses).toHaveLength(2);
  });
});

// ── Constants ──────────────────────────────────────────────────────────────

describe('constants', () => {
  test('WORD_LENGTH is 5', () => expect(WORD_LENGTH).toBe(5));
  test('MAX_GUESSES is 6', () => expect(MAX_GUESSES).toBe(6));
  test('TILE_STATE has correct, present, absent', () => {
    expect(TILE_STATE.CORRECT).toBe('correct');
    expect(TILE_STATE.PRESENT).toBe('present');
    expect(TILE_STATE.ABSENT).toBe('absent');
  });
  test('all words in WORD_LIST are 5 letters', () => {
    WORD_LIST.forEach(w => expect(w).toHaveLength(5));
  });
});
