import type { Nuxt, NuxtOptions } from '@nuxt/schema'
import type { Configuration } from '@rspack/core'
import { logger } from '@nuxt/kit'
import { cloneDeep } from 'lodash-es'
import { toArray } from '.'

export interface RspackConfigContext {
  nuxt: Nuxt
  options: NuxtOptions
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

export function createRspackConfigContext(nuxt: Nuxt): RspackConfigContext {
  return {
    nuxt,
    options: nuxt.options,
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
  const filenames: Record<string, any> = {
    app: ({ isDev }: RspackConfigContext) => isDev ? '[name].js' : '[contenthash:7].js',
    chunk: ({ isDev }: RspackConfigContext) => isDev ? '[name].js' : '[contenthash:7].js',
    css: ({ isDev }: RspackConfigContext) => isDev ? '[name].css' : 'css/[contenthash:7].css',
    font: ({ isDev }: RspackConfigContext) => isDev ? '[path][name].js' : 'fonts/[name].[contenthash:7].[ext]',
    img: ({ isDev }: RspackConfigContext) => isDev ? '[name].js' : 'img/[name].[contenthash:7].[ext]',
    video: ({ isDev }: RspackConfigContext) => isDev ? '[name].js' : 'videos/[name].[contenthash:7].[ext]',
  }

  let fileName = filenames[key]

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
