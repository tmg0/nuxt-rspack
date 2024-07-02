import type { RspackConfigContext } from '../utils/config'

export function assets(ctx: RspackConfigContext) {
  ctx.config.module!.rules!.push(
    {
      test: /\.(png|jpe?g|gif|svg|webp)$/i,
      use: [{
        loader: 'url-loader',
      }],
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
      use: [{
        loader: 'url-loader',
      }],
    },
    {
      test: /\.(webm|mp4|ogv)$/i,
      use: [{
        loader: 'file-loader',
      }],
    },
  )
}
