import { browser } from "$app/environment"

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
