/**
 * Minimal PNG decoder + image comparison for the start-page parity test.
 *
 * Playwright screenshots are non-interlaced, 8-bit PNGs in RGB or RGBA, so that
 * is all this handles (it throws on anything else instead of guessing). Keeping
 * the comparison in-process means the test can diff against the *live* page's
 * screenshots in `tests/reference/` without extra dependencies.
 */

import { inflateSync } from 'node:zlib'

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 4: 2, 6: 4 }

export interface RgbaImage {
  width: number
  height: number
  /** RGBA, 4 bytes per pixel, row-major. */
  data: Uint8Array
}

interface Header {
  width: number
  height: number
  bitDepth: number
  colorType: number
  interlace: number
}

function readHeader(buffer: Buffer): Header {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('Not a PNG file')
  }
  const type = buffer.toString('ascii', 12, 16)
  if (type !== 'IHDR') {
    throw new Error(`Expected IHDR, found ${type}`)
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer.readUInt8(24),
    colorType: buffer.readUInt8(25),
    interlace: buffer.readUInt8(28),
  }
}

/** Concatenated payload of all IDAT chunks. */
function readImageData(buffer: Buffer): Buffer {
  const parts: Buffer[] = []
  let offset = 8

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const start = offset + 8
    if (type === 'IDAT') {
      parts.push(buffer.subarray(start, start + length))
    }
    if (type === 'IEND') {
      break
    }
    offset = start + length + 4 // skip CRC
  }

  return Buffer.concat(parts)
}

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  return pb <= pc ? b : c
}

export function decodePng(buffer: Buffer): RgbaImage {
  const header = readHeader(buffer)
  const channels = CHANNELS[header.colorType]
  if (header.bitDepth !== 8 || channels === undefined || header.interlace !== 0) {
    throw new Error(
      `Unsupported PNG (bit depth ${header.bitDepth}, colour type ${header.colorType}, ` +
        `interlace ${header.interlace})`,
    )
  }

  const inflated = inflateSync(readImageData(buffer))
  const { width, height } = header
  const stride = width * channels

  // Un-filter scanlines in place (`inflated` already has the extra filter byte).
  const pixels = Buffer.alloc(stride * height)
  let source = 0
  for (let y = 0; y < height; y += 1) {
    const filter = inflated.readUInt8(source)
    source += 1
    const rowStart = y * stride
    const previousStart = rowStart - stride

    for (let x = 0; x < stride; x += 1) {
      const raw = inflated.readUInt8(source + x)
      const left = x >= channels ? (pixels[rowStart + x - channels] ?? 0) : 0
      const up = y > 0 ? (pixels[previousStart + x] ?? 0) : 0
      const upLeft = y > 0 && x >= channels ? (pixels[previousStart + x - channels] ?? 0) : 0

      let value: number
      switch (filter) {
        case 0:
          value = raw
          break
        case 1:
          value = raw + left
          break
        case 2:
          value = raw + up
          break
        case 3:
          value = raw + ((left + up) >> 1)
          break
        case 4:
          value = raw + paeth(left, up, upLeft)
          break
        default:
          throw new Error(`Unsupported PNG filter ${filter}`)
      }
      pixels[rowStart + x] = value & 0xff
    }
    source += stride
  }

  // Expand to RGBA.
  const data = new Uint8Array(width * height * 4)
  for (let index = 0; index < width * height; index += 1) {
    const src = index * channels
    const dst = index * 4
    switch (channels) {
      case 1:
        data[dst] = pixels[src] ?? 0
        data[dst + 1] = pixels[src] ?? 0
        data[dst + 2] = pixels[src] ?? 0
        data[dst + 3] = 255
        break
      case 2:
        data[dst] = pixels[src] ?? 0
        data[dst + 1] = pixels[src] ?? 0
        data[dst + 2] = pixels[src] ?? 0
        data[dst + 3] = pixels[src + 1] ?? 255
        break
      case 3:
        data[dst] = pixels[src] ?? 0
        data[dst + 1] = pixels[src + 1] ?? 0
        data[dst + 2] = pixels[src + 2] ?? 0
        data[dst + 3] = 255
        break
      default:
        data[dst] = pixels[src] ?? 0
        data[dst + 1] = pixels[src + 1] ?? 0
        data[dst + 2] = pixels[src + 2] ?? 0
        data[dst + 3] = pixels[src + 3] ?? 255
        break
    }
  }

  return { width, height, data }
}

export interface DiffResult {
  /** Pixels whose colour differs at all, per million pixels. */
  ratio: number
  differingPixels: number
  totalPixels: number
  /** Largest per-channel difference found (0…255). */
  maxChannelDelta: number
}

/**
 * Compares two images of identical size. Any channel difference counts — the
 * point of the parity test is "looks the same", so a low budget of a few
 * hundred anti-aliasing pixels is expected, a layout shift is not.
 */
export function diffImages(expected: RgbaImage, actual: RgbaImage): DiffResult {
  if (expected.width !== actual.width || expected.height !== actual.height) {
    return {
      ratio: 1,
      differingPixels: expected.width * expected.height,
      totalPixels: expected.width * expected.height,
      maxChannelDelta: 255,
    }
  }

  let differingPixels = 0
  let maxChannelDelta = 0

  for (let index = 0; index < expected.data.length; index += 4) {
    const delta = Math.max(
      Math.abs((expected.data[index] ?? 0) - (actual.data[index] ?? 0)),
      Math.abs((expected.data[index + 1] ?? 0) - (actual.data[index + 1] ?? 0)),
      Math.abs((expected.data[index + 2] ?? 0) - (actual.data[index + 2] ?? 0)),
      Math.abs((expected.data[index + 3] ?? 0) - (actual.data[index + 3] ?? 0)),
    )
    if (delta > 0) {
      differingPixels += 1
      maxChannelDelta = Math.max(maxChannelDelta, delta)
    }
  }

  const totalPixels = expected.width * expected.height
  return {
    ratio: totalPixels === 0 ? 0 : differingPixels / totalPixels,
    differingPixels,
    totalPixels,
    maxChannelDelta,
  }
}
