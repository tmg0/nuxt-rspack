import type { RspackConfigContext } from '../utils/config'

export function assets(ctx: RspackConfigContext) {
  ctx.config.module!.rules!.push(
    {
      test: /\.(png|jpe?g|gif)$/i,
      type: 'asset/resource',
    },
  )
}
