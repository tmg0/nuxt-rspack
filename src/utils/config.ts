import type { Nuxt, NuxtOptions } from '@nuxt/schema'
import type { Configuration } from '@rspack/core'
import { cloneDeep } from 'lodash-es'
import { toArray } from '.'

export interface RspackConfigContext {
  nuxt: Nuxt
  options: NuxtOptions
  userConfig: Omit<NuxtOptions['webpack'], '$client' | '$server'>
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
    userConfig: {},
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

export function getRspackConfig(ctx: RspackConfigContext): Configuration {
  // Clone to avoid leaking config between Client and Server
  // TODO: rewrite webpack implementation to avoid necessity for this
  return cloneDeep(ctx.config ?? {})
}
