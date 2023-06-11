<script lang="ts">
  import { getContext } from 'svelte'
  import { duration } from '$lib/stores'
  import { type GridLine, processGridLine } from './utils'
  import { COLOR } from './config'

  export let preds: number[]
  export let trues: number[]
  export let circle: boolean = false

  const beats: GridLine[] = processGridLine(preds, trues)
  const wrongBeats: GridLine[] = beats.filter((beat) => beat.wrong)

  console.log('wrongBeats', wrongBeats, beats)

  getContext<any>('canvas').addItem(
    (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
      ctx.save()
      ctx.beginPath()
      for (const { pred } of wrongBeats) {
        const x = (pred / $duration) * width
        console.log('addItem', width, height, dpr, x)
        if (circle) {
          ctx.strokeStyle = COLOR.GRID_WRONG_DOWNBEAT
          ctx.lineWidth = dpr * 1
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
        } else {
          ctx.strokeStyle = COLOR.GRID_WRONG_BEAT
          ctx.lineWidth = dpr * 1
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
        }
      }
      ctx.stroke()
      ctx.restore()
    },
  )
</script>
