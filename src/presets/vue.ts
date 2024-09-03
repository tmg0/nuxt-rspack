import { resolve } from 'pathe'
import rspack from '@rspack/core'
import VueSSRClientPlugin from '../plugins/vue/client.js'
import type { RspackConfigContext } from '../utils/config'

export function vue(ctx: RspackConfigContext) {
  ctx.config.module!.rules!.push({
    test: /\.vue$/i,
    use: ['/Users/zekun.jin/Developer/Repositories/Tamago/nuxt-rspack/src/loaders/vue.cjs'],
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
