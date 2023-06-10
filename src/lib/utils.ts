import { browser } from "$app/environment"
import { BEAT_TOLERANCE } from "./config"

export function getCssVarColorAsHex(cssVar: string): string {
  if (!browser) return ''

  // Get CSS Variable
  let rootStyle = getComputedStyle(document.documentElement)
  let rgbString = rootStyle.getPropertyValue(cssVar).trim()

  // Split the string into an array
  let rgbValues = rgbString.split(' ')

  // Convert the strings to numbers
  let r = parseInt(rgbValues[0])
  let g = parseInt(rgbValues[1])
  let b = parseInt(rgbValues[2])

  // Convert to hex and pad with zeros if necessary
  let rHex = r.toString(16).padStart(2, '0')
  let gHex = g.toString(16).padStart(2, '0')
  let bHex = b.toString(16).padStart(2, '0')

  // Combine into a single string
  let hexColor = `#${rHex}${gHex}${bHex}`

  return hexColor
}


export type GridLine = {
  pred: number
  true: number
  wrong: boolean
}

// Exclude downbeats from beats.
export function excludeDownbeats(beats: number[], downbeats: number[]): number[] {
  return beats.filter((t) => {
    const diffs = downbeats.map((v) => Math.abs(v - t))
    const min = Math.min(...diffs)
    return min > BEAT_TOLERANCE
  })
}

export function processGridLine(preds: number[], trues: number[]): GridLine[] {
  return preds.map((pred) => {
    const diffs = trues.map((tru) => Math.abs(tru - pred))
    const min = Math.min(...diffs)
    return {
      pred: pred,
      true: trues[diffs.indexOf(min)],
      wrong: min > BEAT_TOLERANCE,
    }
  })
}