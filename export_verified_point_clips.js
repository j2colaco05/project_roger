const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repo = "/Users/joashcolaco/Documents/volleyball_video_analysis";
const runName = "mango_s6_w6_court1_part2";
const outDir = process.argv[2];

if (!outDir) throw new Error("Usage: node export_verified_point_clips.js output_dir");

const ffmpeg = require(path.join(repo, "node_modules", "ffmpeg-static"));
const { parseCsv, renderPointTimestampsMd } = require(
  path.join(repo, "src", "timestamps", "point-timestamp-md")
);

function toSeconds(stamp) {
  return stamp.split(":").reduce((total, value) => total * 60 + Number(value), 0);
}

function toStamp(total) {
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

const runDir = path.join(repo, "runs", runName);
const pointsPath = path.join(runDir, "annotations", "point_timestamps.csv");
const source = fs.readFileSync(path.join(runDir, "input", "source.txt"), "utf8").trim();
const points = parseCsv(fs.readFileSync(pointsPath, "utf8"));

fs.mkdirSync(outDir, { recursive: true });

for (let index = 0; index < points.length; index++) {
  const point = points[index];
  const pointStart = toSeconds(point.start);
  const clipStart = Math.max(0, pointStart - 1);
  const duration = Math.max(1, toSeconds(point.end) - clipStart);
  const review = toSeconds(point.end) - pointStart > 30 ? "_REVIEW_LONG" : "";
  const filename = [
    String(index + 1).padStart(2, "0"),
    point.point_id,
    point.start.replaceAll(":", "-"),
    "to",
    point.end.replaceAll(":", "-"),
  ].join("_") + review + ".mp4";
  const output = path.join(outDir, filename);

  execFileSync(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", toStamp(clipStart), "-i", source, "-t", toStamp(duration),
      "-vf", "scale=960:-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
      "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", output,
    ],
    { stdio: "inherit" }
  );

  execFileSync(ffmpeg, ["-v", "error", "-i", output, "-f", "null", "-"], { stdio: "pipe" });
  console.log(`${index + 1}/${points.length} VERIFIED ${filename}`);
}

fs.writeFileSync(
  path.join(outDir, "point_timestamps.md"),
  renderPointTimestampsMd({ runName, points, source })
);
fs.copyFileSync(pointsPath, path.join(outDir, "point_timestamps.csv"));
console.log(`VERIFIED_OUTPUT_DIR=${outDir}`);
