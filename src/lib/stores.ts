import { writable } from 'svelte/store'

export const duration = writable(0)
export const paused = writable(true)
export const solos = writable([false, false, false, false])