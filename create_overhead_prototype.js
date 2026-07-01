const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("/Users/joashcolaco/Documents/volleyball_video_analysis/node_modules/sharp");
const ffmpeg = require("/Users/joashcolaco/Documents/volleyball_video_analysis/node_modules/ffmpeg-static");

const outDir = path.join(__dirname, "fresh_half_second_scan_35-50", "overhead_simulator");
const frameDir = path.join(outDir, "frames");
let pointId = "R036";
let absoluteStart = 47 * 60 + 26.5;
let output = path.join(outDir, "R036_overhead_6v6_ball_manual_prototype.mp4");
const fps = 15;
let duration = 21;
let keyTimes = [0, 4, 8, 12, 16, 21];

let tracks = {
  N1: [[1.4, 2.4], [2.2, 3.5], [1.9, 4.5], [1.7, 3.0], [1.3, 4.2], [2.1, 3.1]],
  N2: [[4.3, 2.2], [4.1, 4.0], [4.2, 3.0], [4.5, 3.5], [3.6, 3.1], [4.3, 3.0]],
  N3: [[4.1, 7.0], [4.8, 7.4], [5.0, 6.9], [4.7, 6.2], [4.2, 7.1], [4.6, 6.4]],
  N4: [[7.4, 3.1], [7.0, 4.1], [7.3, 4.5], [7.5, 3.7], [7.0, 4.2], [6.6, 3.2]],
  N5: [[2.0, 6.4], [2.8, 6.9], [2.4, 6.1], [2.7, 7.2], [2.1, 6.5], [2.6, 6.8]],
  N6: [[6.8, 6.5], [6.2, 7.0], [6.7, 6.2], [6.1, 7.3], [6.6, 6.6], [6.2, 6.9]],
  F1: [[1.5, 15.2], [1.8, 14.3], [1.4, 15.0], [1.7, 14.0], [1.5, 15.1], [1.8, 14.7]],
  F2: [[3.4, 11.8], [3.8, 12.5], [3.1, 12.0], [3.7, 11.5], [3.2, 12.4], [3.5, 12.0]],
  F3: [[5.6, 12.5], [5.2, 11.8], [5.8, 12.7], [5.3, 12.0], [5.7, 11.6], [5.5, 12.3]],
  F4: [[7.5, 15.0], [7.1, 14.2], [7.7, 14.8], [7.2, 14.0], [7.6, 14.7], [7.3, 14.4]],
  F5: [[2.1, 10.7], [2.8, 11.2], [2.3, 10.5], [2.7, 11.0], [2.2, 10.8], [2.6, 11.1]],
  F6: [[6.9, 10.7], [6.2, 11.1], [6.8, 10.5], [6.3, 11.0], [6.7, 10.8], [6.4, 11.2]],
};

let ballKeyframes = [
  [0.0, 1.4, 2.4], [1.5, 3.8, 10.0], [2.8, 5.5, 15.0], [4.0, 5.2, 12.0],
  [5.3, 4.6, 8.0], [6.6, 4.2, 5.0], [8.0, 6.3, 12.5], [9.4, 5.4, 15.0],
  [10.8, 4.8, 11.0], [12.2, 2.4, 5.0], [13.6, 4.1, 7.5], [15.0, 2.0, 13.5],
  [16.5, 3.4, 15.2], [18.0, 6.7, 5.2], [19.5, 5.8, 7.3], [21.0, 7.2, 12.0],
];

if (process.argv[2] === "R025") {
  pointId = "R025";
  absoluteStart = 42 * 60 + 58;
  output = path.join(outDir, "R025_overhead_6v6_ball_manual_prototype.mp4");
  duration = 16;
  keyTimes = [0, 4, 8, 12, 16];
  tracks = {
    N1: [[1.4, 2.2], [1.8, 3.0], [1.5, 4.1], [1.8, 3.5], [2.0, 2.8]],
    N2: [[4.2, 2.0], [4.4, 3.2], [3.8, 4.4], [4.2, 3.7], [4.5, 2.7]],
    N3: [[7.3, 2.5], [6.9, 3.5], [7.2, 4.4], [6.7, 3.8], [6.4, 2.9]],
    N4: [[2.2, 6.4], [2.8, 7.0], [3.1, 6.2], [2.6, 7.2], [2.4, 6.5]],
    N5: [[4.6, 6.8], [4.9, 7.4], [4.5, 6.3], [5.1, 7.1], [4.7, 6.5]],
    N6: [[6.9, 6.3], [6.2, 7.1], [5.9, 6.0], [6.4, 7.2], [6.7, 6.4]],
    F1: [[1.4, 15.2], [1.9, 14.4], [1.5, 15.0], [1.8, 14.2], [1.6, 14.8]],
    F2: [[4.2, 15.0], [4.5, 14.2], [4.0, 15.1], [4.4, 14.0], [4.3, 14.8]],
    F3: [[7.4, 15.2], [7.0, 14.3], [7.5, 14.9], [7.1, 14.1], [7.3, 14.7]],
    F4: [[2.1, 10.8], [2.7, 11.5], [2.3, 10.6], [2.8, 11.3], [2.4, 10.9]],
    F5: [[4.8, 11.2], [4.3, 10.6], [4.9, 11.4], [4.4, 10.7], [4.7, 11.1]],
    F6: [[7.0, 10.8], [6.3, 11.4], [6.8, 10.5], [6.2, 11.3], [6.6, 10.9]],
  };
  ballKeyframes = [
    [0.0, 7.2, 15.0], [1.5, 5.2, 9.5], [3.0, 4.0, 3.5], [4.5, 4.8, 6.8],
    [6.0, 6.4, 12.0], [7.5, 5.0, 15.0], [9.0, 4.4, 11.0], [10.5, 2.4, 5.0],
    [12.0, 4.5, 7.2], [13.5, 6.5, 13.0], [15.0, 6.8, 15.5], [16.0, 6.2, 12.0],
  ];
}

fs.mkdirSync(frameDir, { recursive: true });

function interpolate(track, time) {
  let index = keyTimes.findIndex((value) => value >= time);
  if (index <= 0) return track[0];
  if (index === -1) return track.at(-1);
  const startTime = keyTimes[index - 1];
  const endTime = keyTimes[index];
  const ratio = (time - startTime) / (endTime - startTime);
  const start = track[index - 1];
  const end = track[index];
  return [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio];
}

function interpolateBall(time) {
  let index = ballKeyframes.findIndex(([keyTime]) => keyTime >= time);
  if (index <= 0) return ballKeyframes[0].slice(1);
  if (index === -1) return ballKeyframes.at(-1).slice(1);
  const start = ballKeyframes[index - 1];
  const end = ballKeyframes[index];
  const ratio = (time - start[0]) / (end[0] - start[0]);
  return [start[1] + (end[1] - start[1]) * ratio, start[2] + (end[2] - start[2]) * ratio];
}

function courtPoint([x, y]) {
  return [76 + x * 38, 30 + (18 - y) * 34];
}

function trailSvg(track, time, color) {
  const points = [];
  for (let offset = 3; offset >= 0; offset -= 0.25) {
    const point = courtPoint(interpolate(track, Math.max(0, time - offset)));
    points.push(point.join(","));
  }
  return `<polyline points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.28"/>`;
}

function playerSvg(id, track, time) {
  const near = id.startsWith("N");
  const color = near ? "#ff5b5f" : "#16c7b7";
  const [x, y] = courtPoint(interpolate(track, time));
  return `${trailSvg(track, time, color)}
    <circle cx="${x}" cy="${y}" r="15" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    <text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#101416">${id}</text>`;
}

function ballSvg(time) {
  const trail = [];
  for (let offset = 1.5; offset >= 0; offset -= 0.15) {
    trail.push(courtPoint(interpolateBall(Math.max(0, time - offset))).join(","));
  }
  const [x, y] = courtPoint(interpolateBall(time));
  return `<polyline points="${trail.join(" ")}" fill="none" stroke="#fff36b" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
    <circle cx="${x}" cy="${y}" r="10" fill="#fff36b" stroke="#15191b" stroke-width="3"/>
    <circle cx="${x - 3}" cy="${y - 3}" r="2.5" fill="#ffffff"/>`;
}

function svg(time) {
  const absolute = absoluteStart + time;
  const minutes = Math.floor(absolute / 60);
  const seconds = (absolute % 60).toFixed(1).padStart(4, "0");
  const players = Object.entries(tracks).map(([id, track]) => playerSvg(id, track, time)).join("\n");
  return `<svg width="960" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect width="960" height="720" fill="#15191b"/>
    <text x="76" y="22" font-family="Arial" font-size="16" font-weight="700" fill="#f7f8f8">${pointId} OVERHEAD MOVEMENT · 6 v 6 + BALL</text>
    <rect x="76" y="30" width="342" height="612" fill="#d8a94a" stroke="#ffffff" stroke-width="4"/>
    <line x1="76" y1="336" x2="418" y2="336" stroke="#ffffff" stroke-width="6"/>
    <line x1="76" y1="234" x2="418" y2="234" stroke="#ffffff" stroke-width="3"/>
    <line x1="76" y1="438" x2="418" y2="438" stroke="#ffffff" stroke-width="3"/>
    <line x1="76" y1="336" x2="418" y2="336" stroke="#202528" stroke-width="2" stroke-dasharray="8 8"/>
    ${players}
    ${ballSvg(time)}
    <text x="494" y="72" font-family="Arial" font-size="36" font-weight="700" fill="#f7f8f8">${minutes}:${seconds}</text>
    <text x="494" y="104" font-family="Arial" font-size="16" fill="#aeb7ba">Rally time ${time.toFixed(1)}s / ${duration.toFixed(1)}s</text>
    <circle cx="510" cy="154" r="10" fill="#ff5b5f"/><text x="530" y="160" font-family="Arial" font-size="18" fill="#f7f8f8">Near team</text>
    <circle cx="510" cy="196" r="10" fill="#16c7b7"/><text x="530" y="202" font-family="Arial" font-size="18" fill="#f7f8f8">Far team</text>
    <circle cx="510" cy="238" r="8" fill="#fff36b"/><text x="530" y="244" font-family="Arial" font-size="18" fill="#f7f8f8">Ball</text>
    <text x="494" y="294" font-family="Arial" font-size="18" font-weight="700" fill="#f7f8f8">Movement trails</text>
    <text x="494" y="324" font-family="Arial" font-size="15" fill="#aeb7ba">Players: 3s · Ball: 1.5s</text>
    <text x="494" y="382" font-family="Arial" font-size="18" font-weight="700" fill="#f7f8f8">Court scale</text>
    <text x="494" y="412" font-family="Arial" font-size="15" fill="#aeb7ba">9 m × 18 m</text>
    <rect x="494" y="568" width="360" height="62" fill="#242a2d" stroke="#657075" stroke-width="1"/>
    <text x="512" y="594" font-family="Arial" font-size="14" font-weight="700" fill="#f7f8f8">MANUAL PROTOTYPE</text>
    <text x="512" y="617" font-family="Arial" font-size="13" fill="#aeb7ba">12 players + ball; manually keyed approximate paths.</text>
  </svg>`;
}

async function main() {
  const frameCount = Math.round(duration * fps);
  for (let frame = 0; frame < frameCount; frame++) {
    const time = frame / fps;
    await sharp(Buffer.from(svg(time))).png().toFile(path.join(frameDir, `frame_${String(frame + 1).padStart(5, "0")}.png`));
    if ((frame + 1) % 45 === 0) console.log(`${frame + 1}/${frameCount}`);
  }

  execFileSync(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-framerate", String(fps),
    "-i", path.join(frameDir, "frame_%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-frames:v", String(frameCount), "-crf", "20", "-movflags", "+faststart", output,
  ], { stdio: "inherit" });

  execFileSync(ffmpeg, ["-v", "error", "-i", output, "-f", "null", "-"], { stdio: "pipe" });
  console.log(`DECODE_OK=${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
