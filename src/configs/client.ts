import { type RspackConfigContext, applyPresets } from '../utils/config'
import { nuxt } from '../presets/nuxt'

export function client(ctx: RspackConfigContext) {
  ctx.name = 'client'
  ctx.isClient = true

  applyPresets(ctx, [
    nuxt,
  ])
}
