import { writable } from 'svelte/store'

export const duration = writable(0)
export const paused = writable(true)
export const metronome = writable(false)
export const mutes = writable([false, false, false, false])
export const loading = writable(true)