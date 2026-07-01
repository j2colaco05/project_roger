const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("/Users/joashcolaco/Documents/volleyball_video_analysis/node_modules/sharp");
const ffmpeg = require("/Users/joashcolaco/Documents/volleyball_video_analysis/node_modules/ffmpeg-static");

const source = "/Users/joashcolaco/Downloads/YTDown_YouTube_Mango-Season-6-Week-6-Court-1-Part2_Media_Hr4J-NVd3yI_001_1080p.mp4";
const root = path.join(__dirname, "fresh_half_second_scan_35-50");
const frameDir = path.join(root, "frames");
const sheetDir = path.join(root, "sheets");
const startSeconds = 35 * 60;
const interval = 0.5;

fs.mkdirSync(frameDir, { recursive: true });
fs.mkdirSync(sheetDir, { recursive: true });

function stamp(total) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${seconds.toFixed(1).padStart(4, "0")}`;
}

async function main() {
  execFileSync(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", "00:35:00", "-i", source, "-t", "00:15:00",
      "-vf", "fps=2,scale=640:-1", "-q:v", "4",
      path.join(frameDir, "frame_%05d.jpg"),
    ],
    { stdio: "inherit" }
  );

  const files = fs.readdirSync(frameDir).filter((file) => file.endsWith(".jpg")).sort();
  const columns = 10;
  const rows = 4;
  const perSheet = columns * rows;
  const width = 192;
  const height = 108;
  const labelHeight = 24;

  for (let offset = 0; offset < files.length; offset += perSheet) {
    const chunk = files.slice(offset, offset + perSheet);
    const composites = [];

    for (let index = 0; index < chunk.length; index++) {
      const absolute = startSeconds + (offset + index) * interval;
      const label = stamp(absolute);
      const image = await sharp(path.join(frameDir, chunk[index]))
        .resize(width, height, { fit: "cover" })
        .extend({ bottom: labelHeight, background: "#111" })
        .composite([{
          input: Buffer.from(`<svg width="${width}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><text x="5" y="17" font-family="Arial" font-size="14" font-weight="700" fill="white">${label}</text></svg>`),
          top: height,
          left: 0,
        }])
        .jpeg({ quality: 88 })
        .toBuffer();

      composites.push({
        input: image,
        left: (index % columns) * width,
        top: Math.floor(index / columns) * (height + labelHeight),
      });
    }

    const first = startSeconds + offset * interval;
    const last = startSeconds + (offset + chunk.length - 1) * interval;
    const filename = `sheet_${String(offset / perSheet + 1).padStart(2, "0")}_${stamp(first).replaceAll(":", "-")}_to_${stamp(last).replaceAll(":", "-")}.jpg`;

    await sharp({
      create: {
        width: columns * width,
        height: rows * (height + labelHeight),
        channels: 3,
        background: "#202020",
      },
    }).composite(composites).jpeg({ quality: 90 }).toFile(path.join(sheetDir, filename));

    console.log(filename);
  }

  console.log(`FRAMES=${files.length}`);
  console.log(`SHEETS=${Math.ceil(files.length / perSheet)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
