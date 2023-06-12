import { browser } from "$app/environment"
import { getCssVarColorAsHex } from "./utils"

export const FPS = 100
export const WINDOW_SECONDS = 8
export const FRAMES_PER_WINDOW = FPS * WINDOW_SECONDS
export const BEAT_TOLERANCE = 0.07

export const COLOR = {
  WAV_BACKGROUND: '#000010',
  NAV_LOW: await getCssVarColorAsHex('--color-tertiary-500'),
  NAV_MID: await getCssVarColorAsHex('--color-primary-500'),
  NAV_HIGH: 'white',
  WAV_LOW: await getCssVarColorAsHex('--color-tertiary-600'),
  WAV_MID: await getCssVarColorAsHex('--color-primary-600'),
  WAV_HIGH: 'white',
  WAV_LOW_OPACITY: 1.0,
  WAV_MID_OPACITY: 1.0,
  WAV_HIGH_OPACITY: 0.5,
  BEAT_CORRECT: await getCssVarColorAsHex('--color-success-500'),
  BEAT_WRONG: await getCssVarColorAsHex('--color-error-500'),
  LABEL_CORRECT: await getCssVarColorAsHex('--color-surface-500'),
  LABEL_SUPER_WRONG: await getCssVarColorAsHex('--color-error-500'),
  LABEL_WRONG: await getCssVarColorAsHex('--color-warning-500'),
  GRID_WRONG_BEAT: '#FAFA33',
  GRID_WRONG_DOWNBEAT: '#FF0000',
}

export const BASE_AUDIO_URL = 'https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com'
export const BEAT_FREQUENCY = 1500
export const DOWNBEAT_FREQUENCY = 3000