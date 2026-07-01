const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ffmpeg = require("/Users/joashcolaco/Documents/project_roger/node_modules/ffmpeg-static");
const source = "/Users/joashcolaco/Downloads/YTDown_YouTube_Mango-Season-6-Week-6-Court-1-Part2_Media_Hr4J-NVd3yI_001_1080p.mp4";
const scanDir = path.join(__dirname, "fresh_half_second_scan_35-50");
const csvPath = path.join(scanDir, "point_timestamps_0.5s_rescan.csv");
const mdPath = path.join(scanDir, "point_timestamps_0.5s_rescan.md");
const outDir = process.argv[2];

if (!outDir) throw new Error("Usage: node export_rescan_point_clips.js output_dir");

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function seconds(stamp) {
  return stamp.split(":").reduce((total, value) => total * 60 + Number(value), 0);
}

function stamp(total) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
}

const points = parseCsv(fs.readFileSync(csvPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

for (let index = 0; index < points.length; index++) {
  const point = points[index];
  const exactStart = seconds(point.start);
  const exactEnd = seconds(point.end);
  const clipStart = Math.max(0, exactStart - 1);
  const clipEnd = point.status === "partial" ? exactEnd : exactEnd + 1;
  const duration = clipEnd - clipStart;
  const filename = `${String(index + 1).padStart(2, "0")}_${point.point_id}_${point.start.replaceAll(":", "-")}_to_${point.end.replaceAll(":", "-")}${point.status === "partial" ? "_PARTIAL" : ""}.mp4`;
  const output = path.join(outDir, filename);

  execFileSync(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", stamp(clipStart), "-i", source, "-t", stamp(duration),
      "-vf", "scale=960:-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
      "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", output,
    ],
    { stdio: "inherit" }
  );

  execFileSync(ffmpeg, ["-v", "error", "-i", output, "-f", "null", "-"], { stdio: "pipe" });
  console.log(`${index + 1}/${points.length} VERIFIED ${filename}`);
}

fs.copyFileSync(csvPath, path.join(outDir, path.basename(csvPath)));
fs.copyFileSync(mdPath, path.join(outDir, path.basename(mdPath)));
console.log(`VERIFIED_OUTPUT_DIR=${outDir}`);
