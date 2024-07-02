import type { RspackConfigContext } from '../utils/config'
import { applyPresets } from '../utils/config'

import { base } from './base'
import { assets } from './assets'
import { esbuild } from './esbuild'
import { vue } from './vue'

export function nuxt(ctx: RspackConfigContext) {
  applyPresets(ctx, [
    base,
    assets,
    esbuild,
    vue,
  ])
}
