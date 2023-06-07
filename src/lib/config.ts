import { browser } from "$app/environment"
import { getCssVarColorAsHex } from "./utils"

export const FPS = 100
export const WINDOW_SECONDS = 8
export const FRAMES_PER_WINDOW = FPS * WINDOW_SECONDS
export const BEAT_TOLERANCE = 0.04

export const COLOR = {
  WAV_BACKGROUND: '#000010',
  WAV_LOW: 'MediumBlue',
  // WAV_LOW: 'darkmagenta',
  // WAV_LOW: getCssVarColorAsHex('--color-secondary-800'),
  // WAV_MID: 'Orange',
  // WAV_MID: 'DarkOrange',
  WAV_MID: getCssVarColorAsHex('--color-warning-500'),
  WAV_HIGH: 'Ivory',
  // WAV_HIGH: getCssVarColorAsHex('--color-primary-200'),
  WAV_LOW_OPACITY: 1.0,
  WAV_MID_OPACITY: 0.9,
  WAV_HIGH_OPACITY: 0.7,
  LABEL: getCssVarColorAsHex('--color-primary-500'),
}

export const BASE_AUDIO_URL = 'https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com'
