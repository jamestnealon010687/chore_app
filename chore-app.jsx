import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "chore-app-data";

const DEFAULT_CHORES = [
  { id: "c1", name: "Brush Teeth", icon: "🪥" },
  { id: "c2", name: "Make Bed", icon: "🛏️" },
  { id: "c3", name: "Pick Up Toys", icon: "🧸" },
  { id: "c4", name: "Get Dressed", icon: "👕" },
  { id: "c5", name: "Wash Hands", icon: "🧼" },
  { id: "c6", name: "Clear Plate", icon: "🍽️" },
  { id: "c7", name: "Put On Shoes", icon: "👟" },
  { id: "c8", name: "Read a Book", icon: "📚" },
];

const AVAILABLE_ICONS = [
  "🪥","🛏️","🧸","👕","🧼","🍽️","👟","📚","🧹","🐕",
  "🐱","🌱","🎨","🎵","🚿","🥤","🍎","🥦","💤","🧤",
  "🎒","✏️","🧃","🥣","🪣","🧺","💊","🪴","🚲","⭐"
];

const KID_COLORS = [
  { bg: "#E8F4FD", border: "#B8DDF0", accent: "#4A9CC9", light: "#F0F8FF", header: "#3A8AB9" },
  { bg: "#FDE8F0", border: "#F0B8D0", accent: "#C94A7C", light: "#FFF0F5", header: "#B93A6C" },
  { bg: "#E8FDE8", border: "#B8F0B8", accent: "#4AC94A", light: "#F0FFF0", header: "#3AB93A" },
];

const CELEBRATION_TYPES = ["confetti", "stars", "hearts", "sparkles", "fireworks", "emoji_rain"];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getDefaultState() {
  return {
    passcode: "1234",
    kids: [
      { id: "k1", name: "Kid 1", active: true, isGuest: false, chores: DEFAULT_CHORES.slice(0, 5).map(c => ({ ...c, id: generateId(), completed: false })) },
      { id: "k2", name: "Kid 2", active: true, isGuest: false, chores: DEFAULT_CHORES.slice(0, 5).map(c => ({ ...c, id: generateId(), completed: false })) },
      { id: "k3", name: "Guest", active: false, isGuest: true, chores: DEFAULT_CHORES.slice(0, 5).map(c => ({ ...c, id: generateId(), completed: false })) },
    ],
    lastReset: new Date().toDateString(),
  };
}

/* ─── Celebration Animations ─── */
function CelebrationOverlay({ type, onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = 300;
    const H = canvas.height = 300;
    let particles = [];
    let frame = 0;
    const maxFrames = 70;

    if (type === "confetti") {
      const colors = ["#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#F97316","#06B6D4","#EC4899"];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: W / 2 + (Math.random() - 0.5) * 40,
          y: H / 2,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.8) * 10 - 4,
          w: Math.random() * 8 + 4,
          h: Math.random() * 6 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.3,
        });
      }
    } else if (type === "stars") {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        particles.push({
          x: W / 2, y: H / 2,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * (2 + Math.random() * 3),
          size: Math.random() * 12 + 8,
          opacity: 1,
          color: ["#FFD700","#FFA500","#FF6347","#FFE66D"][Math.floor(Math.random() * 4)],
        });
      }
    } else if (type === "hearts") {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: W / 2 + (Math.random() - 0.5) * 100,
          y: H + 20,
          vy: -(Math.random() * 3 + 2),
          vx: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 16 + 12,
          opacity: 1,
          wobble: Math.random() * Math.PI * 2,
          color: ["#FF6B9D","#C44569","#FF8BA7","#E84393"][Math.floor(Math.random() * 4)],
        });
      }
    } else if (type === "sparkles") {
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: Math.random() * 6 + 2,
          maxSize: Math.random() * 10 + 6,
          opacity: 0,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.15 + 0.08,
          color: ["#FFD700","#FFFFFF","#87CEEB","#DDA0DD","#98FB98"][Math.floor(Math.random() * 5)],
        });
      }
    } else if (type === "fireworks") {
      const colors = ["#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#F97316"];
      for (let b = 0; b < 3; b++) {
        const bx = W * 0.25 + Math.random() * W * 0.5;
        const by = H * 0.25 + Math.random() * H * 0.3;
        const bColor = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 15; i++) {
          const angle = (Math.PI * 2 * i) / 15;
          const speed = 1.5 + Math.random() * 2.5;
          particles.push({
            x: bx, y: by,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            opacity: 1,
            color: bColor,
            delay: b * 10,
          });
        }
      }
    } else if (type === "emoji_rain") {
      const emojis = ["⭐","🌟","✨","💫","🎉","🎊","🥳","👏","💪","🏆"];
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: Math.random() * W,
          y: -20 - Math.random() * 60,
          vy: Math.random() * 2 + 1.5,
          vx: (Math.random() - 0.5) * 1,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          size: Math.random() * 14 + 18,
          rot: (Math.random() - 0.5) * 0.5,
          opacity: 1,
        });
      }
    }

    function drawStar(cx, cy, size, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
      }
      ctx.closePath();
      ctx.fill();
    }

    function drawHeart(cx, cy, size, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      const s = size / 2;
      ctx.moveTo(cx, cy + s * 0.4);
      ctx.bezierCurveTo(cx, cy - s * 0.2, cx - s, cy - s * 0.6, cx - s, cy + s * 0.1);
      ctx.bezierCurveTo(cx - s, cy + s * 0.6, cx, cy + s, cx, cy + s * 1.1);
      ctx.bezierCurveTo(cx, cy + s, cx + s, cy + s * 0.6, cx + s, cy + s * 0.1);
      ctx.bezierCurveTo(cx + s, cy - s * 0.6, cx, cy - s * 0.2, cx, cy + s * 0.4);
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (type === "confetti") {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          p.rot += p.rotV;
          p.vx *= 0.99;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
      } else if (type === "stars") {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.opacity = Math.max(0, 1 - frame / maxFrames);
          ctx.globalAlpha = p.opacity;
          drawStar(p.x, p.y, p.size * (0.5 + frame / maxFrames * 0.5), p.color);
        });
      } else if (type === "hearts") {
        particles.forEach(p => {
          p.y += p.vy;
          p.x += Math.sin(p.wobble + frame * 0.05) * 0.8;
          p.opacity = Math.max(0, 1 - frame / (maxFrames * 1.2));
          ctx.globalAlpha = p.opacity;
          drawHeart(p.x, p.y, p.size, p.color);
        });
      } else if (type === "sparkles") {
        particles.forEach(p => {
          const t = Math.sin(p.phase + frame * p.speed);
          const currentSize = p.size + (p.maxSize - p.size) * Math.max(0, t);
          p.opacity = Math.max(0, t) * Math.max(0, 1 - frame / (maxFrames * 1.1));
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          // 4-point sparkle
          const s = currentSize;
          ctx.moveTo(p.x, p.y - s);
          ctx.quadraticCurveTo(p.x + s * 0.15, p.y - s * 0.15, p.x + s, p.y);
          ctx.quadraticCurveTo(p.x + s * 0.15, p.y + s * 0.15, p.x, p.y + s);
          ctx.quadraticCurveTo(p.x - s * 0.15, p.y + s * 0.15, p.x - s, p.y);
          ctx.quadraticCurveTo(p.x - s * 0.15, p.y - s * 0.15, p.x, p.y - s);
          ctx.fill();
        });
      } else if (type === "fireworks") {
        particles.forEach(p => {
          if (frame < (p.delay || 0)) return;
          const localFrame = frame - (p.delay || 0);
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.opacity = Math.max(0, 1 - localFrame / (maxFrames * 0.7));
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          // trail
          ctx.globalAlpha = p.opacity * 0.3;
          ctx.beginPath();
          ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (type === "emoji_rain") {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        particles.forEach(p => {
          p.y += p.vy;
          p.x += p.vx;
          p.opacity = Math.max(0, 1 - (frame - 30) / maxFrames);
          ctx.globalAlpha = Math.min(1, p.opacity);
          ctx.font = `${p.size}px serif`;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillText(p.emoji, 0, 0);
          ctx.restore();
        });
      }

      ctx.globalAlpha = 1;
      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        onDone();
      }
    }
    animate();
  }, [type, onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 300,
        height: 300,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
}

/* ─── Passcode Input ─── */
function PasscodeInput({ onSubmit, title = "Enter Passcode" }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [error, setError] = useState(false);

  const handleDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError(false);
    if (value && index < 3) inputRefs[index + 1].current.focus();
    if (newDigits.every(d => d !== "")) {
      const result = onSubmit(newDigits.join(""));
      if (result === false) {
        setError(true);
        setDigits(["", "", "", ""]);
        setTimeout(() => inputRefs[0].current?.focus(), 100);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 700, color: "#4A5568", margin: 0 }}>{title}</h2>
      <div style={{ display: "flex", gap: 12 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 64, height: 80,
              border: `3px solid ${error ? "#FC8181" : d ? "#A78BFA" : "#E2E8F0"}`,
              borderRadius: 16,
              fontSize: 36,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
              background: error ? "#FFF5F5" : "#FFFFFF",
              color: "#4A5568",
              transition: "all 0.2s",
              boxShadow: d ? "0 2px 8px rgba(167,139,250,0.2)" : "none",
            }}
          />
        ))}
      </div>
      {error && <p style={{ color: "#E53E3E", fontFamily: "'Nunito', sans-serif", fontWeight: 600, margin: 0 }}>Wrong passcode, try again!</p>}
    </div>
  );
}

/* ─── Chore Item ─── */
function ChoreItem({ chore, color, onToggle }) {
  const [celebration, setCelebration] = useState(null);
  const itemRef = useRef(null);

  const handleToggle = () => {
    if (!chore.completed) {
      const type = CELEBRATION_TYPES[Math.floor(Math.random() * CELEBRATION_TYPES.length)];
      setCelebration(type);
    }
    onToggle();
  };

  return (
    <div
      ref={itemRef}
      onClick={handleToggle}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: chore.completed ? `${color.accent}18` : "#FFFFFF",
        border: `2px solid ${chore.completed ? color.accent + "40" : "#F0F0F0"}`,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: chore.completed ? "scale(0.98)" : "scale(1)",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        overflow: "visible",
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 40, height: 40, minWidth: 40,
        borderRadius: 12,
        border: `3px solid ${chore.completed ? color.accent : "#D0D0D0"}`,
        background: chore.completed ? color.accent : "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: chore.completed ? `0 2px 8px ${color.accent}40` : "none",
      }}>
        {chore.completed && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {/* Icon */}
      <span style={{ fontSize: 36, lineHeight: 1, filter: chore.completed ? "grayscale(0.3)" : "none" }}>
        {chore.icon}
      </span>
      {/* Name */}
      <span style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        color: chore.completed ? color.accent : "#4A5568",
        textDecoration: chore.completed ? "line-through" : "none",
        opacity: chore.completed ? 0.7 : 1,
        transition: "all 0.3s",
        flex: 1,
      }}>
        {chore.name}
      </span>
      {/* Celebration */}
      {celebration && (
        <CelebrationOverlay type={celebration} onDone={() => setCelebration(null)} />
      )}
    </div>
  );
}

/* ─── Kid Column ─── */
function KidColumn({ kid, colorIndex, onToggleChore }) {
  const color = KID_COLORS[colorIndex % KID_COLORS.length];
  const completedCount = kid.chores.filter(c => c.completed).length;
  const allDone = completedCount === kid.chores.length && kid.chores.length > 0;

  return (
    <div style={{
      flex: 1,
      minWidth: 260,
      maxWidth: 420,
      background: color.bg,
      borderRadius: 24,
      border: `2px solid ${color.border}`,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      transition: "all 0.3s",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 4px 8px",
        borderBottom: `2px solid ${color.border}`,
        marginBottom: 4,
      }}>
        <h2 style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 28,
          fontWeight: 800,
          color: color.header,
          margin: 0,
        }}>
          {kid.name}
        </h2>
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: color.accent,
          background: color.light,
          padding: "4px 12px",
          borderRadius: 20,
          border: `2px solid ${color.border}`,
        }}>
          {completedCount}/{kid.chores.length}
        </div>
      </div>

      {/* All Done Banner */}
      {allDone && (
        <div style={{
          background: `linear-gradient(135deg, ${color.accent}, ${color.header})`,
          borderRadius: 16,
          padding: "12px 16px",
          textAlign: "center",
          animation: "pulse 2s infinite",
        }}>
          <span style={{ fontSize: 32 }}>🎉</span>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "white",
            margin: "4px 0 0",
          }}>All Done! Great Job!</p>
        </div>
      )}

      {/* Chore List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kid.chores.map((chore) => (
          <ChoreItem
            key={chore.id}
            chore={chore}
            color={color}
            onToggle={() => onToggleChore(kid.id, chore.id)}
          />
        ))}
        {kid.chores.length === 0 && (
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 18,
            color: "#A0AEC0",
            textAlign: "center",
            padding: 20,
          }}>No chores yet! Add some in settings ⚙️</p>
        )}
      </div>
    </div>
  );
}

/* ─── Icon Picker ─── */
function IconPicker({ selected, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {AVAILABLE_ICONS.map(icon => (
        <button
          key={icon}
          onClick={() => onSelect(icon)}
          style={{
            width: 44, height: 44,
            fontSize: 24,
            border: selected === icon ? "3px solid #A78BFA" : "2px solid #E2E8F0",
            borderRadius: 10,
            background: selected === icon ? "#F3EAFF" : "white",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

/* ─── Admin Panel ─── */
function AdminPanel({ state, onUpdate, onClose }) {
  const [editingKid, setEditingKid] = useState(null);
  const [newChoreName, setNewChoreName] = useState("");
  const [newChoreIcon, setNewChoreIcon] = useState("⭐");
  const [showIconPicker, setShowIconPicker] = useState(null); // "new" or chore id
  const [changingPasscode, setChangingPasscode] = useState(false);
  const [editingKidName, setEditingKidName] = useState({});

  const updateKid = (kidId, updates) => {
    onUpdate({
      ...state,
      kids: state.kids.map(k => k.id === kidId ? { ...k, ...updates } : k),
    });
  };

  const addChore = (kidId) => {
    if (!newChoreName.trim()) return;
    const kid = state.kids.find(k => k.id === kidId);
    updateKid(kidId, {
      chores: [...kid.chores, { id: generateId(), name: newChoreName.trim(), icon: newChoreIcon, completed: false }],
    });
    setNewChoreName("");
    setNewChoreIcon("⭐");
    setShowIconPicker(null);
  };

  const removeChore = (kidId, choreId) => {
    const kid = state.kids.find(k => k.id === kidId);
    updateKid(kidId, { chores: kid.chores.filter(c => c.id !== choreId) });
  };

  const btnStyle = (color = "#A78BFA") => ({
    fontFamily: "'Nunito', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    padding: "10px 20px",
    borderRadius: 12,
    border: "none",
    background: color,
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
  });

  const inputStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontSize: 16,
    padding: "10px 14px",
    borderRadius: 12,
    border: "2px solid #E2E8F0",
    outline: "none",
    flex: 1,
    minWidth: 0,
  };

  if (changingPasscode) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}>
        <div style={{
          background: "white", borderRadius: 24, padding: 40,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)", textAlign: "center",
        }}>
          <PasscodeInput
            title="Set New Passcode"
            onSubmit={(code) => {
              onUpdate({ ...state, passcode: code });
              setChangingPasscode(false);
              return true;
            }}
          />
          <button onClick={() => setChangingPasscode(false)} style={{ ...btnStyle("#A0AEC0"), marginTop: 20 }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#F7F8FC",
      zIndex: 900, overflowY: "auto",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 40px" }}>
        {/* Admin Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#4A5568", margin: 0 }}>⚙️ Settings</h1>
          <button onClick={onClose} style={btnStyle("#4A9CC9")}>✕ Done</button>
        </div>

        {/* Passcode Section */}
        <div style={{
          background: "white", borderRadius: 20, padding: 20, marginBottom: 20,
          border: "2px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#4A5568", margin: 0 }}>🔒 Passcode</h3>
              <p style={{ fontSize: 14, color: "#A0AEC0", margin: "4px 0 0" }}>Current: {state.passcode.replace(/./g, "•")}</p>
            </div>
            <button onClick={() => setChangingPasscode(true)} style={btnStyle("#A78BFA")}>Change</button>
          </div>
        </div>

        {/* Kids */}
        {state.kids.map((kid, idx) => {
          const color = KID_COLORS[idx % KID_COLORS.length];
          const isEditing = editingKid === kid.id;

          return (
            <div key={kid.id} style={{
              background: "white", borderRadius: 20, padding: 20, marginBottom: 16,
              border: `2px solid ${isEditing ? color.accent : "#E2E8F0"}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              transition: "all 0.3s",
            }}>
              {/* Kid Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isEditing ? 16 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 7,
                    background: color.accent,
                  }} />
                  {isEditing ? (
                    <input
                      value={editingKidName[kid.id] ?? kid.name}
                      onChange={e => setEditingKidName({ ...editingKidName, [kid.id]: e.target.value })}
                      onBlur={() => {
                        if (editingKidName[kid.id]?.trim()) {
                          updateKid(kid.id, { name: editingKidName[kid.id].trim() });
                        }
                        setEditingKidName({ ...editingKidName, [kid.id]: undefined });
                      }}
                      style={{ ...inputStyle, fontSize: 20, fontWeight: 700, maxWidth: 200 }}
                      autoFocus
                    />
                  ) : (
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "#4A5568", margin: 0 }}>{kid.name}</h3>
                  )}
                  {kid.isGuest && (
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: color.accent,
                      background: color.bg, padding: "2px 10px", borderRadius: 8,
                    }}>GUEST</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {kid.isGuest && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#718096" }}>
                        {kid.active ? "On" : "Off"}
                      </span>
                      <div
                        onClick={() => updateKid(kid.id, { active: !kid.active })}
                        style={{
                          width: 52, height: 30, borderRadius: 15,
                          background: kid.active ? color.accent : "#CBD5E0",
                          position: "relative", cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: 12,
                          background: "white",
                          position: "absolute", top: 3,
                          left: kid.active ? 25 : 3,
                          transition: "all 0.3s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        }} />
                      </div>
                    </label>
                  )}
                  <button
                    onClick={() => setEditingKid(isEditing ? null : kid.id)}
                    style={btnStyle(isEditing ? color.accent : "#718096")}
                  >
                    {isEditing ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {/* Expanded Edit */}
              {isEditing && (
                <div>
                  {/* Existing Chores */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {kid.chores.map(chore => (
                      <div key={chore.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 12, background: "#F7F8FC",
                      }}>
                        <span style={{ fontSize: 24 }}>{chore.icon}</span>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "#4A5568", flex: 1 }}>{chore.name}</span>
                        <button
                          onClick={() => removeChore(kid.id, chore.id)}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: "none", background: "#FED7D7", color: "#E53E3E",
                            fontSize: 16, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Chore */}
                  <div style={{
                    padding: 16, borderRadius: 16, background: "#F7F8FC",
                    border: "2px dashed #E2E8F0",
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#718096", margin: "0 0 10px" }}>Add New Chore</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                      <button
                        onClick={() => setShowIconPicker(showIconPicker === "new-" + kid.id ? null : "new-" + kid.id)}
                        style={{
                          width: 48, height: 48, borderRadius: 12,
                          border: "2px solid #E2E8F0", background: "white",
                          fontSize: 24, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >{newChoreIcon}</button>
                      <input
                        value={newChoreName}
                        onChange={e => setNewChoreName(e.target.value)}
                        placeholder="Chore name..."
                        style={inputStyle}
                        onKeyDown={e => e.key === "Enter" && addChore(kid.id)}
                      />
                      <button onClick={() => addChore(kid.id)} style={btnStyle(color.accent)}>Add</button>
                    </div>
                    {showIconPicker === "new-" + kid.id && (
                      <IconPicker selected={newChoreIcon} onSelect={icon => { setNewChoreIcon(icon); setShowIconPicker(null); }} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function ChoreApp() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("main"); // main, passcode, admin
  const [time, setTime] = useState(new Date());

  // Load state
  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get("chore-app-state");
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          // Auto-reset if new day
          const today = new Date().toDateString();
          if (parsed.lastReset !== today) {
            parsed.kids = parsed.kids.map(k => ({
              ...k,
              chores: k.chores.map(c => ({ ...c, completed: false })),
            }));
            parsed.lastReset = today;
          }
          setState(parsed);
        } else {
          setState(getDefaultState());
        }
      } catch {
        setState(getDefaultState());
      }
      setLoading(false);
    }
    load();
  }, []);

  // Save state
  useEffect(() => {
    if (state && !loading) {
      window.storage.set("chore-app-state", JSON.stringify(state)).catch(() => {});
    }
  }, [state, loading]);

  // Clock
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(i);
  }, []);

  const toggleChore = useCallback((kidId, choreId) => {
    setState(prev => ({
      ...prev,
      kids: prev.kids.map(k =>
        k.id === kidId ? {
          ...k,
          chores: k.chores.map(c => c.id === choreId ? { ...c, completed: !c.completed } : c),
        } : k
      ),
    }));
  }, []);

  const handlePasscode = useCallback((code) => {
    if (code === state?.passcode) {
      setScreen("admin");
      return true;
    }
    return false;
  }, [state?.passcode]);

  if (loading || !state) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #F0F4FF 0%, #FFF0F5 50%, #F0FFF0 100%)",
        fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 700, color: "#A0AEC0",
      }}>
        Loading... ✨
      </div>
    );
  }

  const activeKids = state.kids.filter(k => k.active);
  const greeting = time.getHours() < 12 ? "Good Morning" : time.getHours() < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #F0F4FF 0%, #FFF0F5 50%, #F0FFF0 100%)",
      fontFamily: "'Nunito', sans-serif",
      padding: "20px 20px 40px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.85; } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; overscroll-behavior: none; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: 1200,
        margin: "0 auto 24px",
        padding: "0 4px",
      }}>
        <div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 900,
            background: "linear-gradient(135deg, #4A9CC9, #A78BFA, #C94A7C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            lineHeight: 1.2,
          }}>
            ✨ Chore Champions
          </h1>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#A0AEC0", margin: "4px 0 0" }}>
            {greeting}! Let's get things done!
          </p>
        </div>
        <button
          onClick={() => setScreen("passcode")}
          style={{
            width: 52, height: 52, borderRadius: 16,
            border: "2px solid #E2E8F0",
            background: "white",
            fontSize: 24,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.2s",
          }}
        >⚙️</button>
      </div>

      {/* Chore Columns */}
      <div style={{
        display: "flex",
        gap: 20,
        justifyContent: "center",
        maxWidth: 1200,
        margin: "0 auto",
        flexWrap: "wrap",
      }}>
        {activeKids.map((kid, idx) => (
          <KidColumn
            key={kid.id}
            kid={kid}
            colorIndex={state.kids.indexOf(kid)}
            onToggleChore={toggleChore}
          />
        ))}
        {activeKids.length === 0 && (
          <div style={{
            textAlign: "center", padding: 60,
            color: "#A0AEC0", fontSize: 22, fontWeight: 600,
          }}>
            <p style={{ fontSize: 48, margin: "0 0 12px" }}>👋</p>
            <p>No kids set up yet!</p>
            <p>Tap ⚙️ to get started.</p>
          </div>
        )}
      </div>

      {/* Passcode Screen */}
      {screen === "passcode" && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "white",
            borderRadius: 28,
            padding: "40px 48px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}>
            <PasscodeInput title="🔒 Enter Passcode" onSubmit={handlePasscode} />
            <button
              onClick={() => setScreen("main")}
              style={{
                marginTop: 24,
                fontFamily: "'Nunito', sans-serif",
                fontSize: 16, fontWeight: 700,
                padding: "10px 24px", borderRadius: 12,
                border: "none", background: "#E2E8F0", color: "#718096",
                cursor: "pointer",
              }}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {screen === "admin" && (
        <AdminPanel
          state={state}
          onUpdate={(newState) => setState(newState)}
          onClose={() => setScreen("main")}
        />
      )}
    </div>
  );
}
