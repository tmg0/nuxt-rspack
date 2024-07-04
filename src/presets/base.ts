import { resolve } from 'pathe'
import type { Configuration } from '@rspack/core'
import type { NuxtOptions } from '@nuxt/schema'
import { joinURL } from 'ufo'
import { type RspackConfigContext, applyPresets, fileName } from '../utils/config'

export function base(ctx: RspackConfigContext) {
  applyPresets(ctx, [
    baseAlias,
    baseConfig,
  ])
}

function baseAlias(ctx: RspackConfigContext) {
  ctx.alias = {
    '#app': ctx.options.appDir,
    '#build/plugins': resolve(ctx.options.buildDir, 'plugins', ctx.isClient ? 'client' : 'server'),
    '#build': ctx.options.buildDir,
    '#internal/nuxt/paths': resolve(ctx.nuxt.options.buildDir, 'paths.mjs'),
    ...ctx.options.alias,
    ...ctx.alias,
  }
  if (ctx.isClient) {
    ctx.alias['nitro/runtime'] = resolve(ctx.nuxt.options.buildDir, 'nitro.client.mjs')
  }
}

const statsMap: Record<NuxtOptions['logLevel'], Configuration['stats']> = {
  silent: 'none',
  info: 'normal',
  verbose: 'verbose',
}

function baseConfig(ctx: RspackConfigContext) {
  ctx.config = {
    name: ctx.name,
    entry: { app: [resolve(ctx.options.appDir, ctx.options.experimental.asyncEntry ? 'entry.async' : 'entry')] },
    experiments: { css: true },
    optimization: { ...ctx.userConfig.optimization as any, minimize: !ctx.isDev, minimizer: [] },
    module: { rules: [] },
    plugins: [],
    externals: [],
    mode: ctx.isDev ? 'development' : 'production',
    cache: !!ctx.isDev,
    output: getOutput(ctx),
    stats: statsMap[ctx.nuxt.options.logLevel] ?? statsMap.info,
    ...ctx.config,
  }
}

function getOutput(ctx: RspackConfigContext): Configuration['output'] {
  return {
    path: resolve(ctx.options.buildDir, 'dist', ctx.isServer ? 'server' : joinURL('client', ctx.options.app.buildAssetsDir)),
    filename: fileName(ctx, 'app'),
    chunkFilename: fileName(ctx, 'chunk'),
    publicPath: joinURL(ctx.options.app.baseURL, ctx.options.app.buildAssetsDir),
  }
}
