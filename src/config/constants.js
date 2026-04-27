const GAME_MODES = {
  ONE_V_ONE: '1v1',
  FOUR_PLAYER: '4player',
};

const MATCH_STATUS = {
  WAITING: 'waiting',
  PHASE1: 'phase1',
  PHASE2: 'phase2',
  PHASE3: 'phase3',
  FINISHED: 'finished',
};

const PLAYER_STATUS = {
  ACTIVE: 'active',
  SPECTATING: 'spectating',
  ELIMINATED: 'eliminated',
};

const QUESTION_TYPES = {
  MCQ: 'mcq',
  QUICK_INPUT: 'quick_input',
  NUMERIC: 'numeric',
};

const ITEM_TYPES = {
  ELIMINATE_TWO: 'eliminate_two',
  HINT: 'hint',
  FREEZE_TIME: 'freeze_time',
  SHIELD: 'shield',
  DOUBLE_DAMAGE: 'double_damage',
  STEAL: 'steal',
  SKIP: 'skip',
  REVEAL: 'reveal',
  NARROW_RANGE: 'narrow_range',
};

const ROUNDS = {
  BUILD: 1,
  BATTLE: 2,
  FINAL: 3,
};

const GOLD_COSTS = {
  eliminate_two: 50,
  hint: 30,
  freeze_time: 60,
  shield: 40,
  double_damage: 70,
  steal: 80,
  skip: 20,
  reveal: 90,
  narrow_range: 50,
};

const ROLES = {
  PLAYER: 'player',
  ADMIN: 'admin',
};

const NOTIFICATION_TYPES = {
  MATCH_INVITE: 'match_invite',
  MATCH_RESULT: 'match_result',
  GEM_REWARD: 'gem_reward',
  SYSTEM: 'system',
  ADMIN_CUSTOM: 'admin_custom',
};

const DIFFICULTY_CONFIG = {
  easy:   { points: 10, baseTime: 15, color: '\uD83D\uDFE2', label: '\u0633\u0647\u0644' },
  medium: { points: 20, baseTime: 12, color: '\uD83D\uDFE1', label: '\u0645\u062A\u0648\u0633\u0637' },
  hard:   { points: 30, baseTime: 10, color: '\uD83D\uDD34', label: '\u0635\u0639\u0628' },
};

const CATEGORY_CONFIG = {
  din:       { label: '\u062F\u064A\u0646',        icon: '\uD83D\uDD4C', types: ['mcq', 'quick_input'],             defaultDifficulty: 'medium', extraTime: 3 },
  tarikh:    { label: '\u062A\u0627\u0631\u064A\u062E',      icon: '\uD83D\uDCDC', types: ['mcq', 'quick_input', 'numeric'], defaultDifficulty: 'medium', extraTime: 0 },
  geography: { label: '\u062C\u063A\u0631\u0627\u0641\u064A\u0627',    icon: '\uD83C\uDF0D', types: ['mcq', 'quick_input', 'numeric'], defaultDifficulty: 'easy',   extraTime: 0 },
  science:   { label: '\u0639\u0644\u0648\u0645',       icon: '\uD83D\uDD2C', types: ['mcq', 'quick_input', 'numeric'], defaultDifficulty: 'medium', extraTime: 0 },
  sport:     { label: '\u0631\u064A\u0627\u0636\u0629',      icon: '\u26BD',  types: ['mcq', 'quick_input', 'numeric'], defaultDifficulty: 'easy',   extraTime: 0 },
  art:       { label: '\u0641\u0646',         icon: '\uD83C\uDFA8', types: ['mcq', 'quick_input'],             defaultDifficulty: 'medium', extraTime: 0 },
  tech:      { label: '\u062A\u0642\u0646\u064A\u0629',      icon: '\uD83D\uDCBB', types: ['mcq', 'quick_input', 'numeric'], defaultDifficulty: 'hard',   extraTime: 2 },
  language:  { label: '\u0644\u063A\u0629',        icon: '\uD83D\uDCDD', types: ['mcq', 'quick_input'],             defaultDifficulty: 'medium', extraTime: 3 },
  general:   { label: '\u062B\u0642\u0627\u0641\u0629 \u0639\u0627\u0645\u0629', icon: '\uD83E\uDDE0', types: ['mcq', 'quick_input', 'numeric'], defaultDifficulty: 'easy',   extraTime: 0 },
  math:      { label: '\u0631\u064A\u0627\u0636\u064A\u0627\u062A',    icon: '\uD83D\uDD22', types: ['mcq', 'numeric'],               defaultDifficulty: 'hard',   extraTime: 5 },
};

module.exports = {
  GAME_MODES,
  MATCH_STATUS,
  PLAYER_STATUS,
  QUESTION_TYPES,
  ITEM_TYPES,
  ROUNDS,
  GOLD_COSTS,
  ROLES,
  NOTIFICATION_TYPES,
  DIFFICULTY_CONFIG,
  CATEGORY_CONFIG,
};
