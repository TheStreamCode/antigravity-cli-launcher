const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const width = 256;
const height = 256;

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }

  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  const payload = Buffer.concat([typeBuffer, data]);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(payload), 0);

  return Buffer.concat([length, payload, crc]);
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function blend(base, overlay, alpha) {
  return [
    clamp(base[0] * (1 - alpha) + overlay[0] * alpha),
    clamp(base[1] * (1 - alpha) + overlay[1] * alpha),
    clamp(base[2] * (1 - alpha) + overlay[2] * alpha),
    255,
  ];
}

function isInsideRoundedRect(x, y, left, top, right, bottom, radius) {
  const cx = Math.max(left + radius, Math.min(x, right - radius));
  const cy = Math.max(top + radius, Math.min(y, bottom - radius));
  const dx = x - cx;
  const dy = y - cy;

  return x >= left && x <= right && y >= top && y <= bottom && dx * dx + dy * dy <= radius * radius;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const lengthSquared = vx * vx + vy * vy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / lengthSquared));
  const x = ax + t * vx;
  const y = ay + t * vy;
  const dx = px - x;
  const dy = py - y;

  return Math.sqrt(dx * dx + dy * dy);
}

function pixelColor(x, y) {
  const gradient = y / (height - 1);
  let color = blend([8, 11, 25, 255], [23, 18, 54, 255], gradient);

  const dx = x - 128;
  const dy = y - 128;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 112) {
    color = blend(color, [129, 140, 248, 255], Math.max(0, 1 - distance / 112) * 0.18);
  }

  if (isInsideRoundedRect(x, y, 52, 54, 204, 202, 34)) {
    color = blend(color, [14, 16, 38, 255], 0.92);
  }

  if (isInsideRoundedRect(x, y, 52, 54, 204, 202, 34) && !isInsideRoundedRect(x, y, 60, 62, 196, 194, 26)) {
    color = blend(color, [129, 140, 248, 255], 0.72);
  }

  // Upward chevron (anti-gravity arrowhead)
  const chevron = Math.min(
    distanceToSegment(x, y, 86, 150, 128, 100),
    distanceToSegment(x, y, 170, 150, 128, 100),
  );
  if (chevron <= 9) {
    color = blend(color, [233, 233, 255, 255], 1);
  } else if (chevron <= 12) {
    color = blend(color, [233, 233, 255, 255], 0.45);
  }

  // Vertical stem rising upward
  const stem = distanceToSegment(x, y, 128, 168, 128, 116);
  if (stem <= 9) {
    color = blend(color, [129, 140, 248, 255], 1);
  } else if (stem <= 12) {
    color = blend(color, [129, 140, 248, 255], 0.45);
  }

  const accentA = distanceToSegment(x, y, 178, 58, 196, 76);
  const accentB = distanceToSegment(x, y, 60, 178, 78, 196);
  if (Math.min(accentA, accentB) <= 5) {
    color = blend(color, [167, 139, 250, 255], 0.95);
  }

  return color;
}

const raw = Buffer.alloc((width * 4 + 1) * height);
let offset = 0;

for (let y = 0; y < height; y += 1) {
  raw[offset] = 0;
  offset += 1;

  for (let x = 0; x < width; x += 1) {
    const [r, g, b, a] = pixelColor(x, y);
    raw[offset] = r;
    raw[offset + 1] = g;
    raw[offset + 2] = b;
    raw[offset + 3] = a;
    offset += 4;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const mediaDir = path.resolve(__dirname, '..', 'media');
fs.mkdirSync(mediaDir, { recursive: true });
fs.writeFileSync(path.join(mediaDir, 'icon.png'), png);
