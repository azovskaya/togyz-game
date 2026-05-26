import { useState, useEffect, useCallback } from "react";

// ─── КОНСТАНТЫ И ЛОГИКА ─────────────────────────────────────────────────────
const TOTAL = 18;
const INIT = 9;

const HOLE_NAMES = [
  "Арт", "Тектурмас", "Атотпес", "Атсыратар", "Бель", "Бельбасар",
  "Кандыкакпан", "Кокмоин", "Мандай",
];

const THEME = {
  gold: "#c9a227",
  goldBright: "#e8c96a",
  crimson: "#8b2635",
  crimsonLight: "#c44d5a",
  woodDark: "#1a0c04",
  woodMid: "#3d2610",
  woodLight: "#5c3a1e",
  felt: "#140a04",
  text: "#d4b896",
  textMuted: "#8c6b4a",
};

const owner = (h) => (h < 9 ? 0 : 1);
const nextHole = (h) => (h + 1) % TOTAL;
const initBoard = () => Array(TOTAL).fill(INIT);

const getDisplayNumber = (h) => (h < 9 ? h + 1 : h - 8);

const topRowIndices = [17, 16, 15, 14, 13, 12, 11, 10, 9];
const bottomRowIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

// ─── МАТЕМАТИКА ИГРЫ ─────────────────────────────────────────────────────────
function applyMove(board, kazans, tuzdyk, player, holeIdx) {
  const b = [...board];
  const k = [...kazans];
  const t = [...tuzdyk];

  let stones = b[holeIdx];
  if (stones === 0) return null;

  let cur = holeIdx;
  let lastBoardHole = -1;

  if (stones === 1) {
    b[holeIdx] = 0;
  } else {
    b[holeIdx] = 1;
    stones--;
  }

  while (stones > 0) {
    cur = nextHole(cur);
    if (t[player] !== -1 && cur === t[player]) {
      k[player]++;
    } else if (t[1 - player] !== -1 && cur === t[1 - player]) {
      k[1 - player]++;
    } else {
      b[cur]++;
      lastBoardHole = cur;
    }
    stones--;
  }

  let captured = [];
  let newTuzdyk = false;

  if (lastBoardHole !== -1 && owner(lastBoardHole) !== player) {
    const count = b[lastBoardHole];
    if (count > 0 && count % 2 === 0) {
      k[player] += count;
      captured.push(lastBoardHole);
      b[lastBoardHole] = 0;
    } else if (
      count === 3 &&
      t[player] === -1 &&
      lastBoardHole !== (1 - player) * 9 + 8
    ) {
      t[player] = lastBoardHole;
      newTuzdyk = true;
    }
  }

  return { board: b, kazans: k, tuzdyk: t, captured, lastHole: lastBoardHole, newTuzdyk };
}

function validMoves(board, tuzdyk, player) {
  const start = player * 9;
  const frozenInMyRow = tuzdyk[1 - player];
  const moves = [];
  for (let i = start; i < start + 9; i++) {
    if (board[i] > 0 && i !== frozenInMyRow) moves.push(i);
  }
  return moves;
}

function collectRemaining(board, kazans) {
  const k = [...kazans];
  for (let i = 0; i < TOTAL; i++) k[owner(i)] += board[i];
  return k;
}

// ─── ИИ ──────────────────────────────────────────────────────────────────────
function aiPick(board, kazans, tuzdyk, player, level) {
  const moves = validMoves(board, tuzdyk, player);
  if (!moves.length) return null;

  if (level === 1) {
    const capturingMoves = moves.filter((m) => {
      const r = applyMove(board, kazans, tuzdyk, player, m);
      return r && r.captured.length > 0;
    });
    if (capturingMoves.length > 0 && Math.random() > 0.6) {
      return capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (level === 2) {
    let bestScore = -Infinity;
    let bestMove = moves[0];
    for (const m of moves) {
      const r = applyMove(board, kazans, tuzdyk, player, m);
      if (!r) continue;
      let score = r.kazans[player] - kazans[player];
      if (r.newTuzdyk) score += 8;
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
    return bestMove;
  }

  let best = -Infinity;
  let bestMove = moves[0];
  for (const m of moves) {
    const r = applyMove(board, kazans, tuzdyk, player, m);
    if (!r) continue;
    let score = r.kazans[player] - kazans[player];
    if (r.newTuzdyk) score += 15;

    const oppMoves = validMoves(r.board, r.tuzdyk, 1 - player);
    let maxOpponentGain = 0;
    for (const om of oppMoves) {
      const or2 = applyMove(r.board, r.kazans, r.tuzdyk, 1 - player, om);
      if (or2) {
        const gain = or2.kazans[1 - player] - r.kazans[1 - player];
        if (gain > maxOpponentGain) maxOpponentGain = gain;
      }
    }
    score -= maxOpponentGain * 0.85;

    if (score > best) {
      best = score;
      bestMove = m;
    }
  }
  return bestMove;
}

// ─── ОРНАМЕНТ (қошқар мүйіз — бараньи рога) ─────────────────────────────────
function OrnamentBorder({ position = "top" }) {
  const flip = position === "bottom";
  return (
    <svg
      viewBox="0 0 200 24"
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: 22,
        display: "block",
        transform: flip ? "scaleY(-1)" : undefined,
        opacity: 0.85,
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id="ornGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5c3a1e" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#5c3a1e" />
        </linearGradient>
      </defs>
      <path
        d="M0 12 Q25 0 50 12 Q75 24 100 12 Q125 0 150 12 Q175 24 200 12"
        fill="none"
        stroke="url(#ornGold)"
        strokeWidth="1.5"
      />
      {[20, 60, 100, 140, 180].map((x) => (
        <path
          key={x}
          d={`M${x} 12 Q${x - 6} 4 ${x} 8 Q${x + 6} 4 ${x} 12 Q${x - 6} 20 ${x} 16 Q${x + 6} 20 ${x} 12`}
          fill="none"
          stroke="#c9a227"
          strokeWidth="0.8"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

function SteppeBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: `
          radial-gradient(ellipse 120% 60% at 50% -10%, rgba(60, 45, 30, 0.5) 0%, transparent 55%),
          radial-gradient(ellipse 80% 40% at 80% 100%, rgba(139, 38, 53, 0.12) 0%, transparent 50%),
          linear-gradient(180deg, #0f0a06 0%, #1a1208 40%, #0c0804 100%)
        `,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 12px,
            #c9a227 12px,
            #c9a227 13px
          )`,
        }}
      />
    </div>
  );
}

// ─── ЛУНКА (ОТАУ) ───────────────────────────────────────────────────────────
function AuthenticHole({
  idx,
  stones,
  clickable,
  flash,
  lastMoved,
  tuzdykOwner,
  onClick,
  rotate,
}) {
  const isTuzdyk = tuzdykOwner !== -1;
  const dispNum = getDisplayNumber(idx);
  const name = HOLE_NAMES[dispNum - 1];
  const tuzdykColor = tuzdykOwner === 0 ? THEME.gold : THEME.crimsonLight;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      title={`Отау №${dispNum} «${name}»: ${stones} құмалақ`}
      style={{
        width: 58,
        height: 94,
        borderRadius: "29px 29px 22px 22px",
        background: flash
          ? "radial-gradient(ellipse at 50% 35%, #a16207, #451a03 85%)"
          : isTuzdyk
            ? `radial-gradient(ellipse at 50% 25%, #1a1410, #080504 92%)`
            : lastMoved
              ? "radial-gradient(ellipse at 50% 30%, #4a2f18, #1a0c04 90%)"
              : "radial-gradient(ellipse at 50% 28%, #5c3d22, #261408 88%)",
        border: isTuzdyk
          ? `3px double ${tuzdykColor}`
          : "2px solid #120804",
        boxShadow: flash
          ? `0 0 18px rgba(201, 162, 39, 0.55), inset 0 8px 14px rgba(0,0,0,0.85)`
          : "inset 0 10px 18px rgba(0,0,0,0.92), 0 2px 0 rgba(255,220,160,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 4px 6px",
        boxSizing: "border-box",
        cursor: clickable ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: `${clickable ? "scale(1.05)" : "scale(1)"} ${rotate ? "rotate(180deg)" : ""}`,
        position: "relative",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          transform: rotate ? "rotate(180deg)" : "none",
        }}
      >
        {isTuzdyk && (
          <div
            style={{
              fontSize: 7,
              color: "#fff",
              background: tuzdykColor,
              padding: "1px 5px",
              borderRadius: 3,
              letterSpacing: "0.08em",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            ТҰЗДЫҚ
          </div>
        )}

        <span
          style={{
            fontSize: 9,
            color: THEME.textMuted,
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 600,
          }}
        >
          {dispNum}
        </span>

        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: flash ? THEME.goldBright : clickable ? THEME.gold : "#b8956a",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            lineHeight: 1,
          }}
        >
          {stones}
        </span>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            maxWidth: 36,
            justifyContent: "center",
            minHeight: 18,
          }}
        >
          {Array.from({ length: Math.min(stones, 8) }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 5.5,
                borderRadius: "50% 45% 48% 52%",
                background:
                  i % 2 === 0
                    ? "radial-gradient(circle at 32% 28%, #f0ebe3, #a89888 75%)"
                    : "radial-gradient(circle at 32% 28%, #6b6358, #2a2520 88%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.65)",
                transform: `rotate(${i * 37}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── КАЗАН ───────────────────────────────────────────────────────────────────
function CentralKazan({ count, label, isActive, color, rotate }) {
  return (
    <div
      style={{
        flex: 1,
        height: 58,
        background:
          "radial-gradient(ellipse at 50% 15%, #2a1810, #0a0502 95%)",
        borderRadius: "50% 50% 12px 12px / 40% 40% 12px 12px",
        border: `2px solid ${isActive ? color : "#301a0b"}`,
        boxShadow: isActive
          ? `inset 0 6px 14px rgba(0,0,0,0.9), 0 0 12px ${color}33`
          : "inset 0 8px 16px rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxSizing: "border-box",
        transition: "all 0.3s",
        transform: rotate ? "rotate(180deg)" : "none",
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: THEME.textMuted,
          letterSpacing: "0.12em",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 26,
          fontWeight: 700,
          color,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          textShadow: "0 2px 6px rgba(0,0,0,0.95)",
        }}
      >
        {count}
      </span>
    </div>
  );
}

const btnBase = {
  padding: "7px 14px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
  letterSpacing: "0.04em",
  fontFamily: "inherit",
  transition: "background 0.2s, border-color 0.2s",
};

// ─── ГЛАВНЫЙ КОМПОНЕНТ ───────────────────────────────────────────────────────
export default function TogyzkumalaqGame() {
  const [board, setBoard] = useState(initBoard);
  const [kazans, setKazans] = useState([0, 0]);
  const [tuzdyk, setTuzdyk] = useState([-1, -1]);
  const [currentPlayer, setCurrent] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [, setWinner] = useState(null);
  const [finalKazans, setFinalKazans] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [flashHoles, setFlashHoles] = useState([]);
  const [lastMoved, setLastMoved] = useState(-1);

  const [gameMode, setGameMode] = useState("ai");
  const [difficulty, setDifficulty] = useState(2);
  const [showRules, setShowRules] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [scores, setScores] = useState([0, 0]);

  const isPhoneMode = gameMode === "phone";
  const p1Label = isPhoneMode ? "Ойыншы 2" : "Батыр (ИИ)";
  const p0Color = THEME.gold;
  const p1Color = isPhoneMode ? "#7ab8d4" : THEME.crimsonLight;

  const processMove = useCallback(
    (holeIdx) => {
      if (animating || gameOver) return;
      if (owner(holeIdx) !== currentPlayer) return;
      if (board[holeIdx] === 0) return;

      const result = applyMove(board, kazans, tuzdyk, currentPlayer, holeIdx);
      if (!result) return;

      setAnimating(true);
      setLastMoved(holeIdx);

      if (result.captured.length > 0) {
        setFlashHoles(result.captured);
        setStatusMsg(
          `⚔ Жеңілді: +${result.kazans[currentPlayer] - kazans[currentPlayer]} құмалақ`,
        );
      } else if (result.newTuzdyk) {
        setStatusMsg("⚡ Тұздық жарияланды!");
      } else {
        setStatusMsg("");
      }

      setTimeout(() => {
        setBoard(result.board);
        setKazans(result.kazans);
        setTuzdyk(result.tuzdyk);
        setFlashHoles([]);

        const fk = collectRemaining(result.board, result.kazans);

        if (result.kazans[0] > 81 || result.kazans[1] > 81) {
          const endKazans =
            result.kazans[0] > 81
              ? collectRemaining(result.board, result.kazans)
              : fk;
          setFinalKazans(endKazans);
          setKazans(endKazans);
          const w = result.kazans[0] > 81 ? 0 : 1;
          setWinner(w);
          setGameOver(true);
          setScores((prev) => {
            const s = [...prev];
            s[w]++;
            return s;
          });
          setStatusMsg(
            w === 0 ? "🏆 Ойыншы 1 жеңді!" : `🏆 ${p1Label} жеңді!`,
          );
          setAnimating(false);
          return;
        }

        const next = 1 - currentPlayer;
        if (!validMoves(result.board, result.tuzdyk, next).length) {
          const endK = collectRemaining(result.board, result.kazans);
          setFinalKazans(endK);
          setKazans(endK);
          const w =
            endK[0] > endK[1] ? 0 : endK[1] > endK[0] ? 1 : "draw";
          setWinner(w);
          setGameOver(true);
          setScores((prev) => {
            const s = [...prev];
            if (w !== "draw") s[w]++;
            return s;
          });
          setStatusMsg(
            w === "draw"
              ? "🤝 Тең ойын (Атсырау)!"
              : w === 0
                ? "🏆 Ойыншы 1 жеңді!"
                : `🏆 ${p1Label} жеңді!`,
          );
          setAnimating(false);
          return;
        }

        setCurrent(next);
        if (gameMode === "ai" && next === 1) setAiThinking(true);
        setAnimating(false);
      }, 450);
    },
    [board, kazans, tuzdyk, currentPlayer, animating, gameOver, p1Label, gameMode],
  );

  useEffect(() => {
    if (gameMode !== "ai" || currentPlayer !== 1 || gameOver || animating)
      return;
    const t = setTimeout(() => {
      setAiThinking(false);
      const move = aiPick(board, kazans, tuzdyk, 1, difficulty);
      if (move !== null) processMove(move);
    }, 900);
    return () => {
      clearTimeout(t);
      setAiThinking(false);
    };
  }, [
    currentPlayer,
    gameMode,
    gameOver,
    animating,
    board,
    kazans,
    tuzdyk,
    difficulty,
    processMove,
  ]);

  const reset = () => {
    setBoard(initBoard());
    setKazans([0, 0]);
    setTuzdyk([-1, -1]);
    setCurrent(0);
    setGameOver(false);
    setWinner(null);
    setFinalKazans(null);
    setAnimating(false);
    setFlashHoles([]);
    setLastMoved(-1);
    setStatusMsg("");
    setAiThinking(false);
  };

  const myMoves = validMoves(board, tuzdyk, 0);
  const oppMoves = validMoves(board, tuzdyk, 1);

  const renderHole = (h, isOpp) => (
    <AuthenticHole
      key={h}
      idx={h}
      stones={board[h]}
      clickable={
        (isOpp
          ? (isPhoneMode && currentPlayer === 1) || false
          : currentPlayer === 0) &&
        !gameOver &&
        !animating &&
        (isOpp ? oppMoves : myMoves).includes(h)
      }
      flash={flashHoles.includes(h)}
      lastMoved={lastMoved === h}
      tuzdykOwner={
        tuzdyk[0] === h ? 0 : tuzdyk[1] === h ? 1 : -1
      }
      onClick={() => processMove(h)}
      rotate={isOpp && isPhoneMode}
    />
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 8px 24px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1,
      }}
    >
      <SteppeBackground />

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Тақырып — хандық дәуір */}
      <header style={{ marginBottom: 14, zIndex: 10, maxWidth: 420 }}>
        <h1
          style={{
            margin: "0 0 4px",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
            fontWeight: 700,
            color: THEME.gold,
            letterSpacing: "0.06em",
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          Тоғызқұмалақ
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: THEME.textMuted,
            lineHeight: 1.45,
            fontStyle: "italic",
          }}
        >
          Ұлы дала ойыны · қазақ хандығы дәуірінен бері · 162 құмалақ
        </p>
      </header>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "center",
          marginBottom: 12,
          zIndex: 10,
        }}
      >
        <button
          onClick={reset}
          style={{
            ...btnBase,
            background: THEME.woodMid,
            border: `1px solid ${THEME.gold}`,
            color: THEME.goldBright,
          }}
        >
          Жаңа ойын
        </button>

        <button
          onClick={() => {
            setGameMode(gameMode === "ai" ? "phone" : "ai");
            reset();
          }}
          style={{
            ...btnBase,
            background: THEME.felt,
            border: `1px solid ${THEME.woodLight}`,
            color: THEME.text,
          }}
        >
          {gameMode === "ai" ? "🤖 ИИ-ға қарсы" : "📱 Екі ойыншы"}
        </button>

        {gameMode === "ai" && (
          <button
            onClick={() => setDifficulty((d) => (d === 3 ? 1 : d + 1))}
            style={{
              ...btnBase,
              background: THEME.felt,
              border: `1px solid ${THEME.woodLight}`,
              color:
                difficulty === 3
                  ? THEME.crimsonLight
                  : difficulty === 2
                    ? THEME.goldBright
                    : "#7cb89a",
            }}
          >
            {difficulty === 3
              ? "Хан (қиын)"
              : difficulty === 2
                ? "Сарбаз (орта)"
                : "Бала (жеңіл)"}
          </button>
        )}

        <button
          onClick={() => setShowRules(true)}
          style={{
            ...btnBase,
            background: "transparent",
            border: `1px solid ${THEME.woodLight}`,
            color: THEME.textMuted,
          }}
        >
          Ережелер
        </button>
      </div>

      <div
        style={{
          marginBottom: 14,
          fontSize: 12.5,
          color: THEME.text,
          padding: "6px 18px",
          background: "rgba(10, 6, 3, 0.85)",
          borderRadius: 20,
          border: `1px solid ${THEME.woodMid}`,
          textAlign: "center",
          minWidth: 260,
          zIndex: 10,
          backdropFilter: "blur(4px)",
        }}
      >
        {gameOver ? (
          <strong style={{ color: THEME.goldBright }}>{statusMsg}</strong>
        ) : aiThinking ? (
          <span style={{ color: p1Color }}>Батыр ойланып жатыр…</span>
        ) : (
          <span>
            Жүріс:{" "}
            <strong style={{ color: currentPlayer === 0 ? p0Color : p1Color }}>
              {currentPlayer === 0 ? "ОЙЫНШЫ 1 (СІЗ)" : p1Label.toUpperCase()}
            </strong>
            {statusMsg && (
              <span style={{ color: THEME.gold, marginLeft: 8 }}>
                {statusMsg}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Ағаш тақта */}
      <div
        style={{
          background: `
            linear-gradient(145deg, #4a3018 0%, #2d1a0c 35%, #1a0c04 70%, #120804 100%)
          `,
          borderRadius: 20,
          padding: "12px 12px 16px",
          border: "6px solid #0d0602",
          outline: `2px solid ${THEME.woodLight}`,
          outlineOffset: -4,
          boxShadow:
            "0 28px 56px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,220,160,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "relative",
          zIndex: 10,
        }}
      >
        <OrnamentBorder position="top" />

        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            transform: isPhoneMode ? "rotate(180deg)" : "none",
            transition: "transform 0.5s",
          }}
        >
          {topRowIndices.map((h) => renderHole(h, true))}
        </div>

        <div
          style={{
            background: THEME.felt,
            padding: "10px 10px",
            borderRadius: 14,
            display: "flex",
            gap: 10,
            alignItems: "center",
            border: `1px solid ${THEME.woodMid}`,
            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.75)",
          }}
        >
          <CentralKazan
            count={kazans[1]}
            label={isPhoneMode ? "ҚАЗАН II" : "ҚАЗАН БАТЫР"}
            isActive={currentPlayer === 1}
            color={p1Color}
            rotate={isPhoneMode}
          />
          <div
            title="Белдеу — орталық бөлу"
            style={{
              width: 5,
              height: 44,
              background: `linear-gradient(180deg, ${THEME.gold}, ${THEME.woodDark})`,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <CentralKazan
            count={kazans[0]}
            label="ҚАЗАН I"
            isActive={currentPlayer === 0}
            color={p0Color}
          />
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {bottomRowIndices.map((h) => renderHole(h, false))}
        </div>

        <OrnamentBorder position="bottom" />
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 36,
          color: THEME.textMuted,
          fontSize: 12,
          fontWeight: 700,
          zIndex: 10,
        }}
      >
        <span>
          Ойыншы 1:{" "}
          <strong style={{ color: p0Color }}>{scores[0]}</strong>
        </span>
        <span>
          {p1Label}: <strong style={{ color: p1Color }}>{scores[1]}</strong>
        </span>
      </div>

      {gameOver && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4, 2, 1, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
          }}
        >
          <div
            style={{
              background: `linear-gradient(160deg, ${THEME.woodMid}, ${THEME.woodDark})`,
              border: `2px solid ${THEME.gold}`,
              borderRadius: 12,
              padding: "28px 36px",
              textAlign: "center",
              maxWidth: 340,
              boxShadow: "0 24px 48px rgba(0,0,0,0.9)",
            }}
          >
            <div
              style={{
                fontSize: 28,
                marginBottom: 8,
                color: THEME.gold,
                fontFamily: '"Cormorant Garamond", serif',
              }}
            >
              ☽
            </div>
            <h2
              style={{
                color: THEME.goldBright,
                margin: "0 0 10px",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 22,
              }}
            >
              {statusMsg}
            </h2>
            {finalKazans && (
              <p style={{ color: THEME.text, fontSize: 13, marginTop: 0 }}>
                Құмалақ: Ойыншы 1 — {finalKazans[0]} | {p1Label} —{" "}
                {finalKazans[1]}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                ...btnBase,
                marginTop: 12,
                background: THEME.woodLight,
                border: `1px solid ${THEME.gold}`,
                color: THEME.goldBright,
                fontWeight: 700,
                padding: "10px 28px",
              }}
            >
              Қайта ойнау
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ЕРЕЖЕЛЕР ────────────────────────────────────────────────────────────────
function RulesModal({ onClose }) {
  const rules = [
    [
      "🎯 Мақсат",
      "Өз қазаныңызға кемінде 82 құмалақ жинау. Барлығы 162 — Ұлы дала санындағы толық ойын.",
    ],
    [
      "📱 Екі ойыншы",
      "Бір экранда кезекпен: Ойыншы 2 кезегінде жоғарғы қатар мен қазан сізге қарай айналады — нақты тақта сияқты.",
    ],
    [
      "♟ Жүріс",
      "Отаудан бір құмалақ қалдырылады, қалғандары сағат тілінің кері бағытында бір-бірден таратылады. Бір құмалақ болса — көршілес отауға көшеді.",
    ],
    [
      "⚔ Жеңу",
      "Соңғы құмалақ қарсы жақтағы отауда тасты санын жұп етсе — барлық құмалақ қазаныңызға.",
    ],
    [
      "⚡ Тұздық",
      "Соңғы тасты қарсы отауда дәл 3 құмалақ қалдырса — отау мәңгілік Тұздық болады; одан өткен әр тас қазаныңызға түседі.",
    ],
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(160deg, #2d1809, ${THEME.woodDark})`,
          border: `2px solid ${THEME.woodLight}`,
          borderRadius: 10,
          padding: 26,
          maxWidth: 460,
          width: "92%",
          color: THEME.text,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 24px 48px rgba(0,0,0,0.92)",
        }}
      >
        <h3
          style={{
            color: THEME.gold,
            marginTop: 0,
            textAlign: "center",
            letterSpacing: "0.1em",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          КОШЕВНИК КОДЕКСІ
        </h3>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: THEME.textMuted,
            marginTop: -8,
            marginBottom: 18,
            fontStyle: "italic",
          }}
        >
          Алтын Орда мен қазақ хандығы дәуірінен бері даланың ақыл ойыны
        </p>
        {rules.map(([title, text]) => (
          <div key={title} style={{ marginBottom: 14, textAlign: "left" }}>
            <div
              style={{
                color: THEME.goldBright,
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "#c4a882" }}>
              {text}
            </div>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 8,
            background: THEME.woodLight,
            border: `1px solid ${THEME.gold}`,
            color: THEME.goldBright,
            cursor: "pointer",
            borderRadius: 4,
            fontWeight: 700,
            fontFamily: "inherit",
          }}
        >
          Тақтаға оралу
        </button>
      </div>
    </div>
  );
}
