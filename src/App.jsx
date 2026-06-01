import { useState, useEffect, useCallback, useRef } from "react";
import {
  t,
  loadLang,
  saveLang,
  LANGUAGES,
  getHoleNames,
  getRules,
} from "./i18n";
import { getSowingPath } from "./boardVisual";
import {
  TOTAL,
  INIT,
  owner,
  nextHole,
  initBoard,
  topRowIndices,
  bottomRowIndices,
} from "./gameConstants";
import {
  YurtScene,
  BoardOrnament,
  PitCell,
  CentralKazan,
  PlayerPlate,
  VictoryOverlay,
} from "./PremiumUI";
import "./App.css";

const THEME = {
  p1: "#d4af5a",
  p1Bright: "#f0d78c",
  p2: "#7eb8e8",
  ai: "#e87888",
};

function canDeclareTuzdyk(tuzdyk, player, lastBoardHole) {
  if (lastBoardHole === (1 - player) * 9 + 8) return false;
  const pos = lastBoardHole % 9;
  if (tuzdyk[1 - player] !== -1 && tuzdyk[1 - player] % 9 === pos) return false;
  return true;
}

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
      canDeclareTuzdyk(t, player, lastBoardHole)
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

export default function TogyzkumalaqGame() {
  const [lang, setLang] = useState(loadLang);
  const [board, setBoard] = useState(initBoard);
  const [kazans, setKazans] = useState([0, 0]);
  const [tuzdyk, setTuzdyk] = useState([-1, -1]);
  const [currentPlayer, setCurrent] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [finalKazans, setFinalKazans] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [flashHoles, setFlashHoles] = useState([]);
  const [lastMoved, setLastMoved] = useState(-1);
  const [sowingHole, setSowingHole] = useState(-1);
  const [tuzdykPulse, setTuzdykPulse] = useState(false);
  const [boardLit, setBoardLit] = useState(false);
  const animToken = useRef(0);

  const [gameMode, setGameMode] = useState("ai");
  const [difficulty, setDifficulty] = useState(2);
  const [showRules, setShowRules] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [scores, setScores] = useState([0, 0]);

  const holeNames = getHoleNames(lang);
  const isPhoneMode = gameMode === "phone";
  const p1Label = isPhoneMode ? t(lang, "player2") : t(lang, "aiWarrior");
  const p0Color = THEME.p1;
  const p1Color = isPhoneMode ? THEME.p2 : THEME.ai;
  const p2TurnUi = isPhoneMode && currentPlayer === 1;

  useEffect(() => {
    document.documentElement.lang = lang === "kk" ? "kk" : lang === "ru" ? "ru" : "en";
    document.title = `${t(lang, "title")} — ${t(lang, "subtitle").split("·")[0].trim()}`;
  }, [lang]);

  const changeLang = (code) => {
    setLang(code);
    saveLang(code);
  };

  const finishMove = useCallback(
    (result, holeIdx) => {
      setBoard(result.board);
      setKazans(result.kazans);
      setTuzdyk(result.tuzdyk);
      setFlashHoles([]);
      setSowingHole(-1);
      setBoardLit(false);

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
          w === 0 ? t(lang, "winP1") : t(lang, "winP2", { name: p1Label }),
        );
        setAnimating(false);
        return;
      }

      const next = 1 - currentPlayer;
      if (!validMoves(result.board, result.tuzdyk, next).length) {
        const endK = collectRemaining(result.board, result.kazans);
        setFinalKazans(endK);
        setKazans(endK);
        const w = endK[0] > endK[1] ? 0 : endK[1] > endK[0] ? 1 : "draw";
        setWinner(w);
        setGameOver(true);
        setScores((prev) => {
          const s = [...prev];
          if (w !== "draw") s[w]++;
          return s;
        });
        setStatusMsg(
          w === "draw"
            ? t(lang, "draw")
            : w === 0
              ? t(lang, "winP1")
              : t(lang, "winP2", { name: p1Label }),
        );
        setAnimating(false);
        return;
      }

      setCurrent(next);
      if (gameMode === "ai" && next === 1) setAiThinking(true);
      setAnimating(false);
    },
    [currentPlayer, gameMode, lang, p1Label],
  );

  const processMove = useCallback(
    (holeIdx) => {
      if (animating || gameOver) return;
      if (owner(holeIdx) !== currentPlayer) return;
      if (board[holeIdx] === 0) return;

      const result = applyMove(board, kazans, tuzdyk, currentPlayer, holeIdx);
      if (!result) return;

      const path = getSowingPath(board, tuzdyk, currentPlayer, holeIdx);
      const token = ++animToken.current;

      setAnimating(true);
      setLastMoved(holeIdx);
      setSowingHole(-1);
      setBoardLit(true);

      if (result.captured.length > 0) {
        setFlashHoles(result.captured);
        setStatusMsg(
          t(lang, "capture", {
            n: result.kazans[currentPlayer] - kazans[currentPlayer],
          }),
        );
      } else if (result.newTuzdyk) {
        setStatusMsg(t(lang, "tuzdykDeclared"));
        setTuzdykPulse(true);
        setTimeout(() => setTuzdykPulse(false), 900);
      } else {
        setStatusMsg("");
      }

      const stepMs = Math.min(110, Math.max(42, 520 / Math.max(path.length, 1)));

      const runStep = (i) => {
        if (animToken.current !== token) return;
        if (i >= path.length) {
          setTimeout(() => {
            if (animToken.current !== token) return;
            finishMove(result, holeIdx);
          }, 140);
          return;
        }
        setSowingHole(path[i]);
        setTimeout(() => runStep(i + 1), stepMs);
      };

      if (path.length === 0) {
        setTimeout(() => {
          if (animToken.current !== token) return;
          finishMove(result, holeIdx);
        }, 180);
      } else {
        runStep(0);
      }
    },
    [
      board,
      kazans,
      tuzdyk,
      currentPlayer,
      animating,
      gameOver,
      finishMove,
      lang,
    ],
  );

  useEffect(() => {
    if (gameMode !== "ai" || currentPlayer !== 1 || gameOver || animating)
      return;
    const timer = setTimeout(() => {
      setAiThinking(false);
      const move = aiPick(board, kazans, tuzdyk, 1, difficulty);
      if (move !== null) processMove(move);
    }, 900);
    return () => {
      clearTimeout(timer);
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
    setSowingHole(-1);
    setTuzdykPulse(false);
    setBoardLit(false);
    animToken.current++;
    setStatusMsg("");
    setAiThinking(false);
  };

  const myMoves = validMoves(board, tuzdyk, 0);
  const oppMoves = validMoves(board, tuzdyk, 1);

  const renderHole = (h, isOpp) => (
    <PitCell
      key={h}
      idx={h}
      stones={board[h]}
      clickable={
        (isOpp
          ? isPhoneMode && currentPlayer === 1
          : currentPlayer === 0) &&
        !gameOver &&
        !animating &&
        (isOpp ? oppMoves : myMoves).includes(h)
      }
      flash={flashHoles.includes(h)}
      lastMoved={lastMoved === h}
      sowing={sowingHole === h}
      tuzdykOwner={tuzdyk[0] === h ? 0 : tuzdyk[1] === h ? 1 : -1}
      tuzdykPulse={tuzdykPulse}
      onClick={() => processMove(h)}
      phoneDualFace={isPhoneMode}
      isFarRow={isOpp}
      holeNames={holeNames}
      lang={lang}
    />
  );

  const diffClass =
    difficulty === 3
      ? "btn-diff-hard"
      : difficulty === 2
        ? "btn-diff-mid"
        : "btn-diff-easy";

  const turnLabel =
    currentPlayer === 0
      ? t(lang, "youP1")
      : isPhoneMode
        ? t(lang, "player2")
        : p1Label;

  return (
    <div className="game-root">
      <YurtScene />

      {showRules && (
        <RulesModal lang={lang} onClose={() => setShowRules(false)} />
      )}

      <header className="game-header">
        <h1 className="game-title">{t(lang, "title")}</h1>
        <p className="game-subtitle">{t(lang, "subtitle")}</p>
      </header>

      <div className="player-hud">
        <PlayerPlate
          name={t(lang, "player1")}
          kazanCount={kazans[0]}
          active={currentPlayer === 0 && !gameOver}
          variant="p1"
        />
        <div className="player-hud__turn">
          {!gameOver && (
            <span className="player-hud__turn-text">
              {aiThinking ? t(lang, "aiThinking") : t(lang, "turn")}
            </span>
          )}
        </div>
        <PlayerPlate
          name={p1Label}
          kazanCount={kazans[1]}
          active={currentPlayer === 1 && !gameOver}
          variant="p2"
        />
      </div>

      <div className="toolbar toolbar--minimal">
        <div className="lang-switch" role="group" aria-label="Language">
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <button
              key={code}
              type="button"
              className={`lang-btn ${lang === code ? "active" : ""}`}
              onClick={() => changeLang(code)}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary" onClick={reset}>
          {t(lang, "newGame")}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setGameMode(gameMode === "ai" ? "phone" : "ai");
            reset();
          }}
        >
          {gameMode === "ai" ? t(lang, "modeAi") : t(lang, "modePhone")}
        </button>

        {gameMode === "ai" && (
          <button
            type="button"
            className={`btn btn-ghost ${diffClass}`}
            onClick={() => setDifficulty((d) => (d === 3 ? 1 : d + 1))}
          >
            {difficulty === 3
              ? t(lang, "diffHard")
              : difficulty === 2
                ? t(lang, "diffMid")
                : t(lang, "diffEasy")}
          </button>
        )}

        <button
          type="button"
          className="btn btn-muted"
          onClick={() => setShowRules(true)}
        >
          {t(lang, "rules")}
        </button>
      </div>

      <div className="status-pill">
        {gameOver ? (
          <strong style={{ color: THEME.p1 }}>{statusMsg}</strong>
        ) : aiThinking ? (
          <span style={{ color: p1Color }}>{t(lang, "aiThinking")}</span>
        ) : (
          <>
            <span>
              {t(lang, "turn")}:{" "}
              <strong style={{ color: currentPlayer === 0 ? p0Color : p1Color }}>
                {turnLabel}
              </strong>
              {statusMsg && (
                <span style={{ color: THEME.p1Bright, marginLeft: 8 }}>
                  {statusMsg}
                </span>
              )}
            </span>
            {p2TurnUi && (
              <span className="phone-hint">{t(lang, "phoneHint")}</span>
            )}
          </>
        )}
      </div>

      <div
        className={`wood-board ${boardLit ? "wood-board--lit" : ""} ${tuzdykPulse ? "wood-board--tuzdyk-wave" : ""}`}
      >
        <BoardOrnament edge="top" />
        <div className="wood-board__body">
          <CentralKazan
            side="left"
            count={kazans[1]}
            label={isPhoneMode ? t(lang, "kazan2") : t(lang, "kazanAi")}
            isActive={currentPlayer === 1}
            flipped={isPhoneMode}
          />
          <div className="wood-board__center">
            <section
              className="pit-row pit-row--far"
              aria-label={t(lang, "player2")}
            >
              {topRowIndices.map((h) => renderHole(h, true))}
            </section>
            <section
              className="pit-row pit-row--near"
              aria-label={t(lang, "player1")}
            >
              {bottomRowIndices.map((h) => renderHole(h, false))}
            </section>
          </div>
          <CentralKazan
            side="right"
            count={kazans[0]}
            label={t(lang, "kazan1")}
            isActive={currentPlayer === 0}
            flipped={false}
          />
        </div>
        <BoardOrnament edge="bottom" />
      </div>

      <div className="score-row">
        <span className="score-chip">
          {t(lang, "player1")}:{" "}
          <strong style={{ color: p0Color }}>{scores[0]}</strong>
        </span>
        <span className="score-chip">
          {p1Label}: <strong style={{ color: p1Color }}>{scores[1]}</strong>
        </span>
      </div>

      {gameOver && (
        <VictoryOverlay
          lang={lang}
          statusMsg={statusMsg}
          finalKazans={finalKazans}
          p1Label={p1Label}
          winner={winner}
          onPlayAgain={reset}
        />
      )}
    </div>
  );
}

function RulesModal({ lang, onClose }) {
  const rules = getRules(lang);

  return (
    <div className="rules-overlay" onClick={onClose} role="presentation">
      <div
        className="rules-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3>{t(lang, "rulesTitle")}</h3>
        <p className="rules-intro">{t(lang, "rulesIntro")}</p>
        {rules.map(([title, text]) => (
          <div key={title} className="rules-block">
            <div className="rules-block-title">{title}</div>
            <p className="rules-block-text">{text}</p>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          onClick={onClose}
        >
          {t(lang, "rulesClose")}
        </button>
      </div>
    </div>
  );
}
