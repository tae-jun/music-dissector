import { browser } from "$app/environment"
import { getCssVarColorAsHex } from "./utils"

export const FPS = 100
export const WINDOW_SECONDS = 8
export const FRAMES_PER_WINDOW = FPS * WINDOW_SECONDS
export const BEAT_TOLERANCE = 0.04

export const COLOR = {
  WAV_BACKGROUND: '#000010',
  NAV_LOW: getCssVarColorAsHex('--color-tertiary-500'),
  NAV_MID: getCssVarColorAsHex('--color-secondary-500'),
  NAV_HIGH: 'white',
  // WAV_LOW: 'MediumBlue',
  WAV_LOW: getCssVarColorAsHex('--color-tertiary-600'),
  // WAV_MID: 'DarkOrange',
  WAV_MID: getCssVarColorAsHex('--color-secondary-600'),
  WAV_HIGH: 'white',
  // WAV_HIGH: getCssVarColorAsHex('--color-primary-500'),
  WAV_LOW_OPACITY: 1.0,
  WAV_MID_OPACITY: 1.0,
  WAV_HIGH_OPACITY: 0.5,
}

export const BASE_AUDIO_URL = 'https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com'
