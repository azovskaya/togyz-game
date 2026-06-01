export const LANG_STORAGE_KEY = "togyz-lang";

export const LANGUAGES = {
  kk: "Қазақша",
  ru: "Русский",
  en: "English",
};

const holeNames = {
  kk: [
    "Арт", "Тектурмас", "Атотпес", "Атсыратар", "Бель", "Бельбасар",
    "Кандыкакпан", "Кокмоин", "Мандай",
  ],
  ru: [
    "Арт", "Тектурмас", "Атотпес", "Атсыратар", "Бель", "Бельбасар",
    "Кандыкакпан", "Кокмоин", "Мандай",
  ],
  en: [
    "Art", "Tekturmas", "Atotpes", "Atsyratar", "Bel", "Belbasar",
    "Kandykakpan", "Kokmoin", "Mandai",
  ],
};

const dict = {
  kk: {
    title: "Тоғызқұмалақ",
    subtitle: "Ұлы дала ойыны · 162 құмалақ · дәстүрлі тақта",
    newGame: "Жаңа ойын",
    modeAi: "🤖 ИИ-ға қарсы",
    modePhone: "📱 Екі ойыншы",
    rules: "Ережелер",
    turn: "Жүріс",
    youP1: "Ойыншы 1",
    player1: "Ойыншы 1",
    player2: "Ойыншы 2",
    aiWarrior: "Батыр (ИИ)",
    aiThinking: "Батыр ойланып жатыр…",
    capture: "⚔ Жеңілді: +{n} құмалақ",
    tuzdykDeclared: "⚡ Тұздық жарияланды!",
    winP1: "🏆 Ойыншы 1 жеңді!",
    winP2: "🏆 {name} жеңді!",
    draw: "🤝 Тең ойын!",
    kazan1: "Қазан I",
    kazan2: "Қазан II",
    kazanAi: "Қазан батыр",
    tuzdyk: "Тұздық",
    holeTitle: "Отау №{n} «{name}»: {stones} құмалақ",
    dividerTitle: "Орталық белдеу",
    score: "Есеп",
    playAgain: "Қайта ойнау",
    finalScore: "Құмалақ: {p1} — {s1} · {p2} — {s2}",
    diffEasy: "Бала (жеңіл)",
    diffMid: "Сарбаз (орта)",
    diffHard: "Хан (қиын)",
    rulesTitle: "Ойын ережелері",
    rulesIntro: "Даланың ең көне ақыл ойындарының бірі",
    rulesClose: "Тақтаға оралу",
    phoneHint: "Ойыншы 2: жоғарғы қатар · телефонды өзіңізге қаратыңыз",
    rulesGoalTitle: "🎯 Мақсат",
    rulesGoalText:
      "Өз қазаныңызға кемінде 82 құмалақ жинау. Барлығы 162 тас.",
    rulesPhoneTitle: "📱 Екі ойыншы",
    rulesPhoneText:
      "Бір экран — кезекпен. Жоғарғы қатар ойыншы 2-ге, төменгісі ойыншы 1-ге. Бұрыштар сақталады, тек жазу айналады.",
    rulesMoveTitle: "♟ Жүріс",
    rulesMoveText:
      "Бір тас қалдырылады, қалғандары сағат тілінің кері бағытында. Бір тас болса — көршілес отауға.",
    rulesCaptureTitle: "⚔ Жеңу",
    rulesCaptureText:
      "Соңғы тас қарсы отауда жұп сан жасаса — барлық тастар қазаныңызға.",
    rulesTuzdykTitle: "⚡ Тұздық",
    rulesTuzdykText:
      "Қарсы отауда дәл 3 тас қалса — тұздық (бір рет). Симметриялық тұздыққа болмайды. Мандайға тұздық жарияланбайды.",
  },
  ru: {
    title: "Тогызкумалак",
    subtitle: "Игра Великой степи · 162 камня · классическая доска",
    newGame: "Новая игра",
    modeAi: "🤖 Против ИИ",
    modePhone: "📱 Два игрока",
    rules: "Правила",
    turn: "Ход",
    youP1: "Игрок 1",
    player1: "Игрок 1",
    player2: "Игрок 2",
    aiWarrior: "Батыр (ИИ)",
    aiThinking: "Батыр размышляет…",
    capture: "⚔ Захват: +{n} камней",
    tuzdykDeclared: "⚡ Объявлен туздык!",
    winP1: "🏆 Победа игрока 1!",
    winP2: "🏆 Победа: {name}!",
    draw: "🤝 Ничья!",
    kazan1: "Казан I",
    kazan2: "Казан II",
    kazanAi: "Казан батыра",
    tuzdyk: "Туздык",
    holeTitle: "Лунка №{n} «{name}»: {stones} камней",
    dividerTitle: "Центральная линия",
    score: "Счёт",
    playAgain: "Играть снова",
    finalScore: "Камни: {p1} — {s1} · {p2} — {s2}",
    diffEasy: "Лёгкий",
    diffMid: "Средний",
    diffHard: "Сложный",
    rulesTitle: "Правила игры",
    rulesIntro: "Древняя настольная игра кочевников",
    rulesClose: "К доске",
    phoneHint: "Игрок 2: верхний ряд · поверните телефон к себе",
    rulesGoalTitle: "🎯 Цель",
    rulesGoalText:
      "Собрать в свой казан не менее 82 камней. Всего в игре 162 камня.",
    rulesPhoneTitle: "📱 Два игрока",
    rulesPhoneText:
      "Один экран, ходы по очереди. Верхний ряд — игрок 2, нижний — игрок 1. Углы доски совпадают с логикой хода.",
    rulesMoveTitle: "♟ Ход",
    rulesMoveText:
      "В лунке остаётся один камень, остальные раскладываются против часовой. Один камень — в соседнюю лунку.",
    rulesCaptureTitle: "⚔ Захват",
    rulesCaptureText:
      "Если последний камень попадает в лунку соперника и число становится чётным — все камни в ваш казан.",
    rulesTuzdykTitle: "⚡ Туздык",
    rulesTuzdykText:
      "Ровно 3 камня у соперника — туздык (один раз). Нельзя на симметричную лунку и на «Мандай» соперника.",
  },
  en: {
    title: "Togyz Kumalak",
    subtitle: "Steppe board game · 162 stones · classic rules",
    newGame: "New game",
    modeAi: "🤖 vs AI",
    modePhone: "📱 Two players",
    rules: "Rules",
    turn: "Turn",
    youP1: "Player 1",
    player1: "Player 1",
    player2: "Player 2",
    aiWarrior: "Warrior (AI)",
    aiThinking: "Warrior is thinking…",
    capture: "⚔ Captured: +{n} stones",
    tuzdykDeclared: "⚡ Tuzdyk declared!",
    winP1: "🏆 Player 1 wins!",
    winP2: "🏆 {name} wins!",
    draw: "🤝 Draw!",
    kazan1: "Kazan I",
    kazan2: "Kazan II",
    kazanAi: "Warrior's kazan",
    tuzdyk: "Tuzdyk",
    holeTitle: "Pit #{n} «{name}»: {stones} stones",
    dividerTitle: "Center line",
    score: "Score",
    playAgain: "Play again",
    finalScore: "Stones: {p1} — {s1} · {p2} — {s2}",
    diffEasy: "Easy",
    diffMid: "Medium",
    diffHard: "Hard",
    rulesTitle: "How to play",
    rulesIntro: "An ancient nomadic strategy game",
    rulesClose: "Back to board",
    phoneHint: "Player 2: top row · face the phone toward you",
    rulesGoalTitle: "🎯 Goal",
    rulesGoalText:
      "Collect at least 82 stones in your kazan. There are 162 stones in total.",
    rulesPhoneTitle: "📱 Two players",
    rulesPhoneText:
      "One screen, take turns. Top row is player 2, bottom is player 1. Board corners match the sowing path.",
    rulesMoveTitle: "♟ Move",
    rulesMoveText:
      "Leave one stone in the pit, sow the rest counterclockwise. A single stone moves to the next pit.",
    rulesCaptureTitle: "⚔ Capture",
    rulesCaptureText:
      "If your last stone lands in the opponent's pit and the count becomes even, you capture all stones there.",
    rulesTuzdykTitle: "⚡ Tuzdyk",
    rulesTuzdykText:
      "Exactly 3 stones in the opponent's pit creates a tuzdyk (once per player). Not on the symmetric pit or opponent's ninth pit.",
  },
};

export function getHoleNames(lang) {
  return holeNames[lang] ?? holeNames.en;
}

export function t(lang, key, params = {}) {
  const table = dict[lang] ?? dict.en;
  let str = table[key] ?? dict.en[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

export function loadLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && dict[saved]) return saved;
  } catch {
    /* ignore */
  }
  return "kk";
}

export function saveLang(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

export function getRules(lang) {
  return [
    [t(lang, "rulesGoalTitle"), t(lang, "rulesGoalText")],
    [t(lang, "rulesPhoneTitle"), t(lang, "rulesPhoneText")],
    [t(lang, "rulesMoveTitle"), t(lang, "rulesMoveText")],
    [t(lang, "rulesCaptureTitle"), t(lang, "rulesCaptureText")],
    [t(lang, "rulesTuzdykTitle"), t(lang, "rulesTuzdykText")],
  ];
}
