const fs = require("fs");
const path = require("path");
const sharp = require("/Users/joashcolaco/Documents/project_roger/node_modules/sharp");

const root = path.join(__dirname, "fresh_half_second_scan_35-50");
const csvPath = path.join(root, "point_timestamps_workflow_test_v2.csv");
const frameDir = path.join(root, "frames");
const outDir = path.join(root, "coaching_review_sheets_v2");
const windowStart = 35 * 60;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === '"' && quoted && line[index + 1] === '"') {
        value += '"';
        index++;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        values.push(value);
        value = "";
      } else {
        value += char;
      }
    }
    values.push(value);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function seconds(stamp) {
  return stamp.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

function framePath(time) {
  const frameNumber = Math.max(1, Math.min(1800, Math.round((time - windowStart) * 2) + 1));
  return path.join(frameDir, `frame_${String(frameNumber).padStart(5, "0")}.jpg`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const points = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const width = 320;
  const height = 180;
  const labelHeight = 30;

  for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
    const point = points[pointIndex];
    const start = seconds(point.start);
    const end = seconds(point.end);
    const times = Array.from({ length: 6 }, (_, index) => start + ((end - start) * index) / 5);
    const composites = [];

    for (let index = 0; index < times.length; index++) {
      const label = `${point.point_id}  ${times[index].toFixed(1)}s`;
      const image = await sharp(framePath(times[index]))
        .resize(width, height, { fit: "cover" })
        .extend({ bottom: labelHeight, background: "#111" })
        .composite([{
          input: Buffer.from(`<svg width="${width}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><text x="8" y="21" font-family="Arial" font-size="17" font-weight="700" fill="white">${label}</text></svg>`),
          top: height,
          left: 0,
        }])
        .jpeg({ quality: 90 })
        .toBuffer();

      composites.push({ input: image, left: (index % 3) * width, top: Math.floor(index / 3) * (height + labelHeight) });
    }

    const output = path.join(outDir, `${String(pointIndex + 1).padStart(2, "0")}_${point.point_id}.jpg`);
    await sharp({
      create: { width: width * 3, height: (height + labelHeight) * 2, channels: 3, background: "#202020" },
    }).composite(composites).jpeg({ quality: 92 }).toFile(output);
    console.log(`${pointIndex + 1}/${points.length} ${output}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
