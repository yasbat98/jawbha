// Jawbha - Word Guessing Game Logic

// Target words — chosen as answers
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

// Extra valid guesses — not used as answers but accepted as input
const GUESS_WORDS = [
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult',
  'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert',
  'alien', 'align', 'alive', 'alley', 'allow', 'alone', 'along', 'alter',
  'angel', 'anger', 'angle', 'angry', 'anime', 'ankle', 'annoy', 'apart',
  'apple', 'apply', 'arena', 'argue', 'array', 'arrow', 'asset', 'attic',
  'awful', 'beach', 'beard', 'beast', 'begin', 'bench', 'berry', 'birth',
  'black', 'blade', 'blame', 'bland', 'blank', 'blast', 'bless', 'blind',
  'block', 'blood', 'bloom', 'blown', 'blunt', 'board', 'boast', 'bonus',
  'boost', 'bound', 'brain', 'brand', 'bread', 'break', 'breed', 'brick',
  'bride', 'brief', 'bring', 'brisk', 'broke', 'brook', 'brown', 'brush',
  'build', 'built', 'burst', 'cabin', 'cable', 'carry', 'catch', 'cause',
  'chalk', 'chart', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chief',
  'child', 'choir', 'chord', 'chore', 'claim', 'clash', 'clasp', 'class',
  'clean', 'clear', 'clerk', 'click', 'cliff', 'climb', 'cling', 'clock',
  'close', 'cloth', 'cloud', 'clown', 'coach', 'coast', 'cobra', 'comet',
  'comic', 'coral', 'couch', 'could', 'count', 'court', 'cover', 'crack',
  'crash', 'crisp', 'cross', 'crowd', 'crown', 'crush', 'curve', 'daily',
  'dance', 'decay', 'delta', 'dense', 'depth', 'digit', 'dodge', 'dough',
  'draft', 'drain', 'drama', 'dream', 'dress', 'drift', 'drink', 'drive',
  'drone', 'drown', 'drunk', 'early', 'earth', 'eight', 'elite', 'empty',
  'enemy', 'enter', 'entry', 'erupt', 'evade', 'event', 'every', 'exact',
  'exist', 'fable', 'faith', 'false', 'fancy', 'fatal', 'feast', 'fence',
  'fetch', 'fever', 'field', 'fiend', 'fifth', 'fifty', 'fight', 'final',
  'first', 'fixed', 'flame', 'flash', 'flask', 'flesh', 'flock', 'flood',
  'floor', 'flour', 'fluid', 'flush', 'flute', 'force', 'forge', 'forth',
  'found', 'fruit', 'fully', 'funny', 'giant', 'given', 'gloom', 'gloss',
  'glove', 'going', 'grant', 'grasp', 'grass', 'grave', 'greed', 'grief',
  'grind', 'groan', 'grove', 'grown', 'guard', 'guess', 'guild', 'guise',
  'habit', 'harsh', 'haven', 'haste', 'heart', 'heavy', 'hedge', 'heist',
  'hinge', 'hoard', 'hobby', 'honor', 'horse', 'hotel', 'hound', 'house',
  'human', 'humid', 'humor', 'hurry', 'ideal', 'image', 'imply', 'index',
  'indie', 'infer', 'inner', 'intro', 'irony', 'issue', 'joint', 'judge',
  'juice', 'jumbo', 'karma', 'knife', 'knock', 'known', 'label', 'labor',
  'lance', 'large', 'laser', 'latch', 'later', 'laugh', 'layer', 'learn',
  'lease', 'legal', 'lemon', 'level', 'light', 'limit', 'liner', 'liver',
  'lodge', 'logic', 'loose', 'lover', 'lower', 'loyal', 'lucid', 'lunar',
  'magic', 'major', 'maple', 'marry', 'marsh', 'match', 'mayor', 'media',
  'mercy', 'merit', 'metal', 'might', 'minus', 'model', 'money', 'month',
  'moral', 'mouth', 'movie', 'music', 'naive', 'naval', 'nerve', 'never',
  'night', 'noble', 'noisy', 'nomad', 'north', 'notch', 'novel', 'ocean',
  'offer', 'often', 'olive', 'orbit', 'order', 'other', 'outer', 'paint',
  'paper', 'panic', 'patch', 'pause', 'peace', 'peach', 'pearl', 'penny',
  'perch', 'piano', 'pilot', 'pinch', 'pitch', 'pixel', 'pizza', 'plant',
  'plead', 'pluck', 'plumb', 'plume', 'plush', 'point', 'polar', 'porch',
  'pound', 'power', 'press', 'price', 'pride', 'print', 'proof', 'proud',
  'prowl', 'proxy', 'quake', 'query', 'queue', 'quick', 'quiet', 'quirk',
  'quota', 'rabbi', 'radar', 'rally', 'ranch', 'range', 'rapid', 'reach',
  'ready', 'rebel', 'regal', 'relax', 'repay', 'reset', 'right', 'risen',
  'robot', 'rouse', 'route', 'rowdy', 'saint', 'salad', 'sauce', 'scale',
  'scare', 'scene', 'scone', 'scoop', 'score', 'scout', 'seize', 'sense',
  'seven', 'shade', 'shaft', 'shame', 'shape', 'shark', 'sharp', 'sheen',
  'sheep', 'sheet', 'shell', 'shift', 'shine', 'shirt', 'shock', 'shore',
  'short', 'shout', 'shove', 'shown', 'shrug', 'siege', 'sight', 'since',
  'sixth', 'sixty', 'skill', 'skimp', 'skirt', 'skull', 'slash', 'slave',
  'sleek', 'slick', 'slide', 'slime', 'sling', 'sloth', 'slump', 'smart',
  'smash', 'smell', 'smile', 'smite', 'smoke', 'snack', 'snail', 'snake',
  'sneak', 'sniff', 'snore', 'solar', 'solid', 'solve', 'south', 'space',
  'spare', 'spark', 'spawn', 'speak', 'spear', 'spend', 'spice', 'spike',
  'spine', 'spite', 'split', 'spoke', 'spook', 'spool', 'spore', 'sport',
  'squat', 'squad', 'stack', 'staff', 'stage', 'stain', 'stamp', 'stand',
  'stark', 'start', 'steam', 'steel', 'steep', 'steer', 'stern', 'stick',
  'stiff', 'still', 'sting', 'stock', 'stoic', 'stomp', 'store', 'storm',
  'story', 'stout', 'stove', 'strap', 'straw', 'stray', 'strip', 'strum',
  'strut', 'stuck', 'stump', 'stung', 'style', 'sugar', 'super', 'surge',
  'swamp', 'swear', 'sweat', 'sweep', 'sweet', 'swept', 'swift', 'swipe',
  'swirl', 'sword', 'swore', 'sworn', 'swung', 'table', 'taken', 'tally',
  'talon', 'taunt', 'teach', 'tempo', 'tense', 'terms', 'their', 'theme',
  'there', 'thick', 'thing', 'think', 'third', 'thorn', 'those', 'three',
  'threw', 'throw', 'tiger', 'tight', 'timer', 'tired', 'title', 'today',
  'token', 'tooth', 'topic', 'torch', 'total', 'touch', 'tough', 'towel',
  'toxic', 'track', 'trail', 'train', 'trait', 'tramp', 'trawl', 'trend',
  'trial', 'trick', 'tried', 'troop', 'trout', 'truck', 'truly', 'trunk',
  'trust', 'truth', 'tulip', 'tumor', 'tunic', 'twist', 'ulcer', 'ultra',
  'uncle', 'under', 'union', 'unite', 'until', 'upper', 'upset', 'urban',
  'usher', 'usual', 'utter', 'valid', 'valor', 'value', 'valve', 'venom',
  'verge', 'verse', 'vigil', 'viral', 'virus', 'visor', 'vista', 'vital',
  'vivid', 'vocal', 'voice', 'voter', 'vouch', 'wager', 'wagon', 'waltz',
  'water', 'weary', 'where', 'which', 'while', 'white', 'whole', 'whose',
  'widen', 'wield', 'witch', 'witty', 'woman', 'women', 'world', 'worry',
  'worse', 'worst', 'worth', 'would', 'wound', 'wrath', 'wrist', 'wrong',
  'wrote', 'yacht', 'yearn', 'yield', 'young', 'youth', 'zebra', 'zesty',
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
 * Check if a guess is a valid word (target list OR guess dictionary).
 */
function isValidWord(word) {
  const w = word.toLowerCase();
  return WORD_LIST.includes(w) || GUESS_WORDS.includes(w);
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
    GUESS_WORDS,
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
