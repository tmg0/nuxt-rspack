import type { Nuxt, NuxtOptions } from '@nuxt/schema'
import type { Configuration } from '@rspack/core'
import { logger } from '@nuxt/kit'
import { cloneDeep } from 'lodash-es'
import { toArray } from '.'

export interface RspackConfigContext {
  nuxt: Nuxt
  options: NuxtOptions
  userConfig: typeof DEFAULT_USER_CONFIG
  config: Configuration
  name: string
  isDev: boolean
  isServer: boolean
  isClient: boolean
  alias: { [index: string]: string | false | string[] }
  transpile: RegExp[]
}

type RspackConfigPreset = (ctx: RspackConfigContext, options?: object) => void
type RspackConfigPresetItem = RspackConfigPreset | [RspackConfigPreset, any]

const DEFAULT_USER_CONFIG = {
  filenames: {
    app: ({ isDev }: { isDev: boolean }) => isDev ? '[name].js' : '[contenthash:7].js',
    chunk: ({ isDev }: { isDev: boolean }) => isDev ? '[name].js' : '[contenthash:7].js',
    css: ({ isDev }: { isDev: boolean }) => isDev ? '[name].css' : 'css/[contenthash:7].css',
    img: ({ isDev }: { isDev: boolean }) => isDev ? '[path][name].[ext]' : 'img/[name].[contenthash:7].[ext]',
    font: ({ isDev }: { isDev: boolean }) => isDev ? '[path][name].[ext]' : 'fonts/[name].[contenthash:7].[ext]',
    video: ({ isDev }: { isDev: boolean }) => isDev ? '[path][name].[ext]' : 'videos/[name].[contenthash:7].[ext]',
  } as Record<string, string | ((ctx: { isDev: boolean }) => string)>,

  optimization: {
    runtimeChunk: 'single',
    /** You can set minimizer to a customized array of plugins. */
    minimizer: undefined,
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '/',
      cacheGroups: {},
    },
  },
}

export function createRspackConfigContext(nuxt: Nuxt): RspackConfigContext {
  return {
    nuxt,
    options: nuxt.options,
    userConfig: DEFAULT_USER_CONFIG,
    config: {},
    name: 'base',
    isDev: nuxt.options.dev,
    isServer: false,
    isClient: false,
    alias: {},
    transpile: [],
  }
}

export function applyPresets(ctx: RspackConfigContext, presets: RspackConfigPresetItem | RspackConfigPresetItem[]) {
  for (const preset of toArray(presets)) {
    if (Array.isArray(preset)) {
      preset[0](ctx, preset[1])
    }
    else {
      preset(ctx)
    }
  }
}

export function fileName(ctx: RspackConfigContext, key: string) {
  let fileName = ctx.userConfig.filenames[key]

  if (typeof fileName === 'function') {
    fileName = fileName(ctx)
  }

  if (typeof fileName === 'string' && ctx.options.dev) {
    const hash = /\[(chunkhash|contenthash|hash)(?::\d+)?\]/.exec(fileName)
    if (hash) {
      logger.warn(`Notice: Please do not use ${hash[1]} in dev mode to prevent memory leak`)
    }
  }

  return fileName
}

export function getRspackConfig(ctx: RspackConfigContext): Configuration {
  // Clone to avoid leaking config between Client and Server
  // TODO: rewrite webpack implementation to avoid necessity for this
  return cloneDeep(ctx.config ?? {})
}
