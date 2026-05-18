import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Film,
  Pencil,
  Play,
  Plus,
  RotateCw,
  Save,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import './styles.css';

const COURT = { width: 560, height: 900, pad: 42 };
const PLAY_W = COURT.width - COURT.pad * 2;
const PLAY_H = COURT.height - COURT.pad * 2;
const NET_Y = COURT.height / 2;
const OPPONENT_ATTACK_Y = NET_Y - PLAY_H * 0.17;
const HOME_ATTACK_Y = NET_Y + PLAY_H * 0.17;
const BASELINE_Y = COURT.height - COURT.pad;
const VIEW = {
  x: 0,
  y: OPPONENT_ATTACK_Y - 14,
  width: COURT.width,
  height: BASELINE_Y - OPPONENT_ATTACK_Y + 28,
};
const STORAGE_KEY = 'volleyframe-project-v1';
const ROLE_COLORS = {
  setter: '#f2c14e',
  player: '#3f7cac',
};

const defaultPlayers = [
  { id: 'p1', name: 'Setter', role: 'setter', rotationSlot: 1 },
  { id: 'p2', name: 'P1', role: 'player', rotationSlot: 2 },
  { id: 'p3', name: 'P2', role: 'player', rotationSlot: 3 },
  { id: 'p4', name: 'P3', role: 'player', rotationSlot: 4 },
  { id: 'p5', name: 'P4', role: 'player', rotationSlot: 5 },
  { id: 'p6', name: 'P5', role: 'player', rotationSlot: 6 },
];

const slotPositions = {
  1: { x: COURT.pad + PLAY_W * 0.78, y: COURT.pad + PLAY_H * 0.82 },
  2: { x: COURT.pad + PLAY_W * 0.78, y: COURT.pad + PLAY_H * 0.56 },
  3: { x: COURT.pad + PLAY_W * 0.5, y: COURT.pad + PLAY_H * 0.56 },
  4: { x: COURT.pad + PLAY_W * 0.22, y: COURT.pad + PLAY_H * 0.56 },
  5: { x: COURT.pad + PLAY_W * 0.22, y: COURT.pad + PLAY_H * 0.82 },
  6: { x: COURT.pad + PLAY_W * 0.5, y: COURT.pad + PLAY_H * 0.82 },
};

function createDefaultProject() {
  return {
    title: 'Untitled Rotation',
    players: defaultPlayers,
    frames: [
      {
        id: crypto.randomUUID(),
        name: 'Frame 1',
        positions: Object.fromEntries(defaultPlayers.map((player) => [player.id, slotPositions[player.rotationSlot]])),
      },
    ],
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolatePosition(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function drawCourt(ctx, project, positions, selectedId = null, viewport = VIEW) {
  const dprScale = 2;
  ctx.save();
  ctx.scale(dprScale, dprScale);
  ctx.translate(-viewport.x, -viewport.y);
  ctx.fillStyle = '#f8fbf7';
  ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.fillStyle = '#c98a4a';
  ctx.fillRect(COURT.pad, OPPONENT_ATTACK_Y, PLAY_W, BASELINE_Y - OPPONENT_ATTACK_Y);
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.lineWidth = 1;
  for (let x = COURT.pad + PLAY_W / 6; x < COURT.width - COURT.pad; x += PLAY_W / 6) {
    ctx.beginPath();
    ctx.moveTo(x, OPPONENT_ATTACK_Y);
    ctx.lineTo(x, BASELINE_Y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#fffaf0';
  ctx.lineWidth = 5;
  ctx.strokeRect(COURT.pad, OPPONENT_ATTACK_Y, PLAY_W, BASELINE_Y - OPPONENT_ATTACK_Y);
  ctx.beginPath();
  ctx.moveTo(COURT.pad, NET_Y);
  ctx.lineTo(COURT.width - COURT.pad, NET_Y);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(COURT.pad, OPPONENT_ATTACK_Y);
  ctx.lineTo(COURT.width - COURT.pad, OPPONENT_ATTACK_Y);
  ctx.moveTo(COURT.pad, HOME_ATTACK_Y);
  ctx.lineTo(COURT.width - COURT.pad, HOME_ATTACK_Y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = '700 18px Inter, Arial';
  ctx.fillText(project.title || 'VolleyFrame', COURT.pad, viewport.y + 22);

  project.players.forEach((player) => {
    const pos = positions[player.id];
    if (!pos) return;
    const color = ROLE_COLORS[player.role] || ROLE_COLORS.player;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = selectedId === player.id ? 5 : 3;
    ctx.strokeStyle = selectedId === player.id ? '#18202f' : '#fff';
    ctx.stroke();
    ctx.fillStyle = '#101820';
    ctx.font = '800 13px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.name.slice(0, 9), pos.x, pos.y);
  });
  ctx.restore();
}

function App() {
  const [project, setProject] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : createDefaultProject();
    } catch {
      return createDefaultProject();
    }
  });
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [selectedId, setSelectedId] = useState('p1');
  const [draggingId, setDraggingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [notice, setNotice] = useState('');
  const courtRef = useRef(null);
  const fileRef = useRef(null);

  const currentFrame = project.frames[currentFrameIndex] || project.frames[0];
  const selectedPlayer = project.players.find((player) => player.id === selectedId) || project.players[0];

  const displayedPositions = useMemo(() => {
    if (!isPlaying || project.frames.length < 2) return currentFrame.positions;
    const segment = Math.min(Math.floor(playhead), project.frames.length - 2);
    const t = playhead - segment;
    const from = project.frames[segment].positions;
    const to = project.frames[segment + 1].positions;
    return Object.fromEntries(
      project.players.map((player) => [
        player.id,
        interpolatePosition(from[player.id] || slotPositions[player.rotationSlot], to[player.id] || from[player.id], t),
      ]),
    );
  }, [currentFrame.positions, isPlaying, playhead, project.frames, project.players]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    let animationId;
    let last = performance.now();
    const tick = (now) => {
      const delta = ((now - last) / 1000) * speed;
      last = now;
      setPlayhead((value) => {
        const next = value + delta;
        if (next >= project.frames.length - 1) {
          setIsPlaying(false);
          setCurrentFrameIndex(project.frames.length - 1);
          return 0;
        }
        setCurrentFrameIndex(Math.floor(next));
        return next;
      });
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, project.frames.length, speed]);

  function updateCurrentFramePositions(nextPositions) {
    setProject((prev) => ({
      ...prev,
      frames: prev.frames.map((frame, index) =>
        index === currentFrameIndex ? { ...frame, positions: nextPositions } : frame,
      ),
    }));
  }

  function pointFromEvent(event) {
    const rect = courtRef.current.getBoundingClientRect();
    return {
      x: clamp(VIEW.x + ((event.clientX - rect.left) / rect.width) * VIEW.width, COURT.pad, COURT.width - COURT.pad),
      y: clamp(VIEW.y + ((event.clientY - rect.top) / rect.height) * VIEW.height, OPPONENT_ATTACK_Y, BASELINE_Y),
    };
  }

  function onPointerMove(event) {
    if (!draggingId) return;
    const pos = pointFromEvent(event);
    updateCurrentFramePositions({ ...currentFrame.positions, [draggingId]: pos });
  }

  function addFrame() {
    setProject((prev) => {
      const source = prev.frames[currentFrameIndex] || prev.frames.at(-1);
      const nextFrame = {
        id: crypto.randomUUID(),
        name: `Frame ${prev.frames.length + 1}`,
        positions: structuredClone(source.positions),
      };
      const frames = [...prev.frames.slice(0, currentFrameIndex + 1), nextFrame, ...prev.frames.slice(currentFrameIndex + 1)];
      return { ...prev, frames: frames.map((frame, index) => ({ ...frame, name: `Frame ${index + 1}` })) };
    });
    setCurrentFrameIndex((index) => index + 1);
  }

  function duplicateFrame() {
    addFrame();
    setNotice('Frame duplicated');
  }

  function deleteFrame() {
    if (project.frames.length === 1) {
      setNotice('Keep at least one frame');
      return;
    }
    setProject((prev) => ({
      ...prev,
      frames: prev.frames
        .filter((_, index) => index !== currentFrameIndex)
        .map((frame, index) => ({ ...frame, name: `Frame ${index + 1}` })),
    }));
    setCurrentFrameIndex((index) => Math.max(0, index - 1));
  }

  function rotatePlayers() {
    const nextPositions = { ...currentFrame.positions };
    project.players.forEach((player) => {
      const nextSlot = player.rotationSlot === 1 ? 6 : player.rotationSlot - 1;
      nextPositions[player.id] = slotPositions[nextSlot];
    });
    setProject((prev) => ({
      ...prev,
      players: prev.players.map((player) => ({
        ...player,
        rotationSlot: player.rotationSlot === 1 ? 6 : player.rotationSlot - 1,
      })),
      frames: prev.frames.map((frame, index) =>
        index === currentFrameIndex ? { ...frame, positions: nextPositions } : frame,
      ),
    }));
  }

  function resetNames() {
    setProject((prev) => ({
      ...prev,
      players: prev.players.map((player, index) => ({
        ...player,
        name: index === 0 ? 'Setter' : `P${index}`,
        role: index === 0 ? 'setter' : 'player',
      })),
    }));
  }

  function saveProject() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${safeFileName(project.title)}.volleyframe.json`);
    setNotice('Saved locally and downloaded');
  }

  function importProject(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = JSON.parse(String(reader.result));
        if (!loaded.players || !loaded.frames) throw new Error('Invalid project');
        setProject(loaded);
        setCurrentFrameIndex(0);
        setSelectedId(loaded.players[0]?.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
        setNotice('Project loaded');
      } catch {
        setNotice('Could not load project');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function exportPng() {
    const canvas = document.createElement('canvas');
    canvas.width = VIEW.width * 2;
    canvas.height = VIEW.height * 2;
    const ctx = canvas.getContext('2d');
    drawCourt(ctx, project, currentFrame.positions, selectedId, VIEW);
    canvas.toBlob((blob) => {
      downloadBlob(blob, `${safeFileName(project.title)}-${currentFrame.name}.png`);
      setNotice('PNG exported');
    });
  }

  async function exportVideo() {
    if (project.frames.length < 2) {
      setNotice('Add at least two frames for video');
      return;
    }
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      setNotice('Video export is not supported in this browser');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = VIEW.width * 2;
    canvas.height = VIEW.height * 2;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);
    const options = MediaRecorder.isTypeSupported('video/webm') ? { mimeType: 'video/webm' } : undefined;
    const recorder = new MediaRecorder(stream, options);
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      downloadBlob(blob, `${safeFileName(project.title)}.webm`);
      setNotice('Video exported');
    };
    recorder.start();

    const fps = 30;
    const secondsPerSegment = 1 / speed;
    for (let segment = 0; segment < project.frames.length - 1; segment += 1) {
      const total = Math.max(8, Math.round(fps * secondsPerSegment));
      for (let frame = 0; frame <= total; frame += 1) {
        const t = frame / total;
        const positions = Object.fromEntries(
          project.players.map((player) => [
            player.id,
            interpolatePosition(project.frames[segment].positions[player.id], project.frames[segment + 1].positions[player.id], t),
          ]),
        );
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCourt(ctx, project, positions, null, VIEW);
        await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
      }
    }
    recorder.stop();
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">VF</span>
            <input
              aria-label="Project title"
              value={project.title}
              onChange={(event) => setProject((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="toolbar" aria-label="Simulation controls">
            <button title="Previous frame" onClick={() => setCurrentFrameIndex((index) => Math.max(0, index - 1))}>
              <ChevronLeft size={18} />
            </button>
            <button
              className="primary"
              title={isPlaying ? 'Stop' : 'Play'}
              onClick={() => {
                setPlayhead(currentFrameIndex);
                setIsPlaying((value) => !value);
              }}
            >
              {isPlaying ? <Square size={18} /> : <Play size={18} />}
            </button>
            <button title="Next frame" onClick={() => setCurrentFrameIndex((index) => Math.min(project.frames.length - 1, index + 1))}>
              <ChevronRight size={18} />
            </button>
            <button title="Add frame" onClick={addFrame}>
              <Plus size={18} />
            </button>
            <button title="Duplicate frame" onClick={duplicateFrame}>
              <Copy size={18} />
            </button>
            <button title="Delete frame" onClick={deleteFrame}>
              <Trash2 size={18} />
            </button>
            <button className="rotate-action" title="Rotate players" onClick={rotatePlayers}>
              <RotateCw size={18} />
              Rotate
            </button>
            <label className="speed">
              <span>Speed</span>
              <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </label>
          </div>
        </header>

        <div className="court-wrap">
          <svg
            ref={courtRef}
            className="court"
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
            role="img"
            aria-label="Volleyball court editor"
            onPointerMove={onPointerMove}
            onPointerUp={() => setDraggingId(null)}
            onPointerLeave={() => setDraggingId(null)}
          >
            <defs>
              <pattern id="wood" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="#c98a4a" />
                <path d="M0 12H80M0 40H80M0 68H80" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
                <path d="M14 0V80M48 0V80" stroke="rgba(105,64,32,.16)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect className="court-bg" x="0" y="0" width={COURT.width} height={COURT.height} />
            <rect className="court-floor" x={COURT.pad} y={OPPONENT_ATTACK_Y} width={PLAY_W} height={BASELINE_Y - OPPONENT_ATTACK_Y} />
            <rect className="court-line" x={COURT.pad} y={OPPONENT_ATTACK_Y} width={PLAY_W} height={BASELINE_Y - OPPONENT_ATTACK_Y} />
            <line className="net-shadow" x1={COURT.pad} y1={NET_Y} x2={COURT.width - COURT.pad} y2={NET_Y} />
            <line className="net" x1={COURT.pad} y1={NET_Y} x2={COURT.width - COURT.pad} y2={NET_Y} />
            <line className="attack-line" x1={COURT.pad} y1={OPPONENT_ATTACK_Y} x2={COURT.width - COURT.pad} y2={OPPONENT_ATTACK_Y} />
            <line className="attack-line" x1={COURT.pad} y1={HOME_ATTACK_Y} x2={COURT.width - COURT.pad} y2={HOME_ATTACK_Y} />
            <text className="zone-label" x={COURT.pad + 18} y={COURT.height - COURT.pad - 22}>Back Row</text>
            <text className="zone-label" x={COURT.pad + 18} y={NET_Y + 34}>Front Row</text>
            <text className="net-label" x={COURT.width / 2} y={NET_Y - 14} textAnchor="middle">NET</text>
            {project.players.map((player) => {
              const pos = displayedPositions[player.id];
              if (!pos) return null;
              return (
                <g
                  key={player.id}
                  className={`player-token ${selectedId === player.id ? 'selected' : ''}`}
                  transform={`translate(${pos.x} ${pos.y})`}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setSelectedId(player.id);
                    setDraggingId(player.id);
                  }}
                >
                  <circle r="27" fill={ROLE_COLORS[player.role] || ROLE_COLORS.player} />
                  <circle className="player-ring" r="27" />
                  <text className="player-label" y="4" textAnchor="middle">
                    {compactName(player.name)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="timeline" aria-label="Frame timeline">
          {project.frames.map((frame, index) => (
            <button
              key={frame.id}
              className={index === currentFrameIndex ? 'active' : ''}
              onClick={() => {
                setIsPlaying(false);
                setCurrentFrameIndex(index);
              }}
            >
              <span>{index + 1}</span>
              {frame.name}
            </button>
          ))}
        </div>
      </section>

      <aside className="side-panel">
        <section>
          <div className="section-title">
            <Pencil size={17} />
            <h2>Player</h2>
          </div>
          <label>
            Name
            <input
              value={selectedPlayer?.name || ''}
              onChange={(event) =>
                setProject((prev) => ({
                  ...prev,
                  players: prev.players.map((player) =>
                    player.id === selectedId ? { ...player, name: event.target.value || 'Player' } : player,
                  ),
                }))
              }
            />
          </label>
          <label>
            Role
            <select
              value={selectedPlayer?.role || 'player'}
              onChange={(event) =>
                setProject((prev) => ({
                  ...prev,
                  players: prev.players.map((player) =>
                    player.id === selectedId ? { ...player, role: event.target.value } : player,
                  ),
                }))
              }
            >
              <option value="setter">Setter</option>
              <option value="player">Player</option>
            </select>
          </label>
          <button className="wide" onClick={resetNames}>Reset names</button>
        </section>

        <section>
          <div className="section-title">
            <Save size={17} />
            <h2>Save & Export</h2>
          </div>
          <button className="wide primary" onClick={saveProject}>
            <Download size={18} />
            Save project
          </button>
          <button className="wide" onClick={() => fileRef.current?.click()}>
            <Upload size={18} />
            Load project
          </button>
          <input ref={fileRef} className="hidden" type="file" accept=".json,.volleyframe.json" onChange={importProject} />
          <button className="wide" onClick={exportPng}>
            <Camera size={18} />
            Download PNG
          </button>
          <button className="wide" onClick={exportVideo}>
            <Film size={18} />
            Export WebM
          </button>
        </section>

        <section className="frame-card">
          <h2>{currentFrame.name}</h2>
          <p>{project.frames.length} frame{project.frames.length === 1 ? '' : 's'} in this simulation</p>
        </section>
        {notice && <div className="notice">{notice}</div>}
      </aside>
    </main>
  );
}

function safeFileName(value) {
  return (value || 'volleyframe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'volleyframe';
}

function compactName(value) {
  const clean = value || 'Player';
  return clean.length > 9 ? `${clean.slice(0, 8)}.` : clean;
}

function downloadBlob(blob, fileName) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

createRoot(document.getElementById('root')).render(<App />);
