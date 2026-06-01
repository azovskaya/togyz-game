import { kumalakStyle } from "./boardVisual";
import { getDisplayNumber } from "./gameConstants";
import { t } from "./i18n";

export function YurtScene() {
  return (
    <div className="yurt-scene" aria-hidden>
      <div className="yurt-scene__felt" />
      <div className="yurt-scene__light" />
      <div className="yurt-scene__dust" />
      <div className="yurt-scene__vignette" />
    </div>
  );
}

export function BoardOrnament({ edge }) {
  return (
    <svg
      className={`board-ornament board-ornament--${edge}`}
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="goldInlay" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b4a20" stopOpacity="0.4" />
          <stop offset="25%" stopColor="#e8c56a" />
          <stop offset="50%" stopColor="#fff4d0" />
          <stop offset="75%" stopColor="#e8c56a" />
          <stop offset="100%" stopColor="#6b4a20" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M0 14h40l20-10 20 10h40l15-8 15 8h40l20-12 20 12h40l15-8 15 8h40"
        fill="none"
        stroke="url(#goldInlay)"
        strokeWidth="1.2"
        opacity="0.85"
      />
      {[50, 120, 200, 280, 350].map((x) => (
        <g key={x} transform={`translate(${x}, 14)`} opacity="0.55">
          <path
            d="M0-8 Q-6-4 -4 0 Q-6 4 0 8 Q6 4 4 0 Q6 -4 0 -8"
            fill="none"
            stroke="#e8c56a"
            strokeWidth="0.7"
          />
          <circle cy="0" r="2" fill="#d4af5a" opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}

function Kumalak({ index }) {
  const { rot, x, y, variant } = kumalakStyle(index);
  return (
    <span
      className={`kumalak kumalak--${variant}`}
      style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)` }}
    />
  );
}

function getStoneGrid(count) {
  if (count <= 0) return { cols: 1, size: "lg" };
  if (count <= 3) return { cols: count, size: "lg" };
  if (count <= 6) return { cols: 3, size: "lg" };
  if (count <= 9) return { cols: 3, size: "md" };
  if (count <= 12) return { cols: 4, size: "md" };
  if (count <= 16) return { cols: 4, size: "sm" };
  if (count <= 20) return { cols: 5, size: "sm" };
  if (count <= 25) return { cols: 5, size: "xs" };
  if (count <= 30) return { cols: 6, size: "xs" };
  const cols = Math.min(7, Math.ceil(Math.sqrt(count)));
  return { cols, size: "xxs" };
}

export function StonePile({ count, compact }) {
  if (count <= 0) {
    return <div className="stone-pile stone-pile--empty" aria-hidden />;
  }
  const { cols, size } = getStoneGrid(count);
  return (
    <div
      className={`stone-pile stone-pile--${size}${compact ? " stone-pile--compact" : ""}`}
      style={{ gridTemplateColumns: `repeat(${cols}, min-content)` }}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <Kumalak key={i} index={i} />
      ))}
    </div>
  );
}

export function PitCell({
  idx,
  stones,
  clickable,
  flash,
  lastMoved,
  sowing,
  tuzdykOwner,
  tuzdykPulse,
  onClick,
  phoneDualFace,
  isFarRow,
  holeNames,
  lang,
}) {
  const isTuzdyk = tuzdykOwner !== -1;
  const dispNum = getDisplayNumber(idx);
  const name = holeNames[dispNum - 1];
  const classes = [
    "pit",
    clickable && "pit--clickable",
    flash && "pit--flash",
    sowing && "pit--sowing",
    lastMoved && !flash && !sowing && "pit--last",
    isTuzdyk && "pit--tuzdyk",
    isTuzdyk && tuzdykPulse && "pit--tuzdyk-burst",
    isTuzdyk && tuzdykOwner === 0 && "pit--tuzdyk-p0",
    isTuzdyk && tuzdykOwner === 1 && "pit--tuzdyk-p1",
  ]
    .filter(Boolean)
    .join(" ");

  const rowClass = isFarRow ? "pit--row-far" : "pit--row-near";

  return (
    <button
      type="button"
      className={`${classes} ${rowClass}${phoneDualFace ? " pit--dual-face" : ""}`}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      title={t(lang, "holeTitle", { n: dispNum, name, stones })}
      aria-label={t(lang, "holeTitle", { n: dispNum, name, stones })}
    >
      <div className="pit-rim" aria-hidden />
      <div className="pit-face">
        {isTuzdyk && (
          <span
            className={`pit-badge ${tuzdykOwner === 0 ? "pit-badge--p0" : "pit-badge--p1"}`}
          >
            {t(lang, "tuzdyk")}
          </span>
        )}
        <span className="pit-index">{dispNum}</span>
        <div className="pit-cavity">
          <StonePile count={stones} />
        </div>
        <span className="pit-count">{stones}</span>
      </div>
    </button>
  );
}

export function CentralKazan({ count, label, isActive, flipped, slot }) {
  return (
    <div
      className={`kazan-chalice kazan-chalice--${slot} ${isActive ? "kazan-chalice--active" : ""} ${flipped ? "kazan-chalice--flipped" : ""}`}
    >
      <div className="kazan-chalice__rim" aria-hidden />
      <div className="kazan-chalice__head">
        <span className="kazan-chalice__label">{label}</span>
        <span className="kazan-chalice__count">{count}</span>
      </div>
      <div className="kazan-chalice__bowl">
        <div className="kazan-chalice__heap">
          <StonePile count={count <= 40 ? count : 40} compact />
        </div>
        {count > 40 && <span className="kazan-chalice__more">+{count - 40}</span>}
      </div>
    </div>
  );
}

export function PlayerPlate({ name, kazanCount, active, variant }) {
  return (
    <div
      className={`player-plate player-plate--${variant} ${active ? "player-plate--active" : ""}`}
    >
      <div className="player-plate__avatar" aria-hidden>
        {variant === "p1" ? "Ⅰ" : "Ⅱ"}
      </div>
      <div className="player-plate__info">
        <span className="player-plate__name">{name}</span>
        <span className="player-plate__kazan-num">{kazanCount}</span>
      </div>
    </div>
  );
}

export function VictoryOverlay({
  lang,
  statusMsg,
  finalKazans,
  p1Label,
  winner,
  onPlayAgain,
}) {
  const winSide = winner === 0 ? "p1" : winner === 1 ? "p2" : null;
  return (
    <div className="victory-overlay" role="dialog" aria-modal="true">
      <div className="victory-overlay__frame" aria-hidden />
      <div className="victory-overlay__particles" aria-hidden />
      <div className={`victory-card ${winSide ? `victory-card--${winSide}` : ""}`}>
        <p className="victory-card__title">{t(lang, "victoryTitle")}</p>
        <h2 className="victory-card__subtitle">{statusMsg}</h2>
        {finalKazans && (
          <p className="victory-card__score">
            {t(lang, "finalScore", {
              p1: t(lang, "player1"),
              s1: finalKazans[0],
              p2: p1Label,
              s2: finalKazans[1],
            })}
          </p>
        )}
        <button type="button" className="btn btn-gold" onClick={onPlayAgain}>
          {t(lang, "playAgain")}
        </button>
      </div>
    </div>
  );
}
