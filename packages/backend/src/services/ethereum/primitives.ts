import { as } from '../cast'
import { Bytes } from '../model'

export function asBytesFromData(value: unknown, length?: number) {
  const parsed = as.string(value)
  if (!parsed.startsWith('0x')) {
    throw new TypeError('Data must start with 0x')
  }
  if (parsed.length % 2 !== 0) {
    throw new TypeError('Data must represent each byte as two digits')
  }
  if (length !== undefined && parsed.length !== length * 2 + 2) {
    throw new TypeError(`Length mismatch, expected ${length} bytes`)
  }
  try {
    return Bytes.fromHex(parsed)
  } catch {
    throw new TypeError('Data must be a hex string')
  }
}

export function bytesToData(value: Bytes): string {
  return `0x${value.toHex()}`
}

export const asBigIntFromQuantity = as.mapped(as.string, (value: string) => {
  if (!value.startsWith('0x')) {
    throw new TypeError('Quantity must start with 0x')
  }
  if (value !== '0x0' && value.startsWith('0x0')) {
    throw new TypeError('Quantity cannot have leading zeroes')
  }
  try {
    return BigInt(value)
  } catch {
    throw new TypeError('Quantity must be a hex string')
  }
})

export function bigIntToQuantity(value: BigInt): string {
  if (value < 0n) {
    throw new TypeError('Quantity cannot be a negative integer')
  }
  return `0x${value.toString(16)}`
}
