import { resolve } from 'pathe'
import { VueLoaderPlugin } from 'vue-loader'
import rspack from '@rspack/core'
import VueSSRClientPlugin from '../plugins/vue/client'
import type { RspackConfigContext } from '../utils/config'

export function vue(ctx: RspackConfigContext) {
  // @ts-expect-error de-default vue-loader
  ctx.config.plugins!.push(new (VueLoaderPlugin.default || VueLoaderPlugin)())

  ctx.config.module!.rules!.push({
    test: /\.vue$/i,
    loader: 'vue-loader',
    options: {
      experimentalInlineMatchResource: true,
    },
  })

  if (ctx.isClient) {
    ctx.config.plugins!.push(new VueSSRClientPlugin({
      filename: resolve(ctx.options.buildDir, 'dist/server', `${ctx.name}.manifest.json`),
      nuxt: ctx.nuxt,
    }))
  }

  // Feature flags
  // https://github.com/vuejs/vue-next/tree/master/packages/vue#bundler-build-feature-flags
  // TODO: Provide options to toggle
  ctx.config.plugins!.push(new rspack.DefinePlugin({
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
  }))
}
