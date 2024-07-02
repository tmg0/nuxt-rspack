import type { NuxtBuilder } from 'nuxt/schema'
import { useNitro } from '@nuxt/kit'
import { rspack } from '@rspack/core'
import { defu } from 'defu'
import { resolve } from 'pathe'
import type { InputPluginOption } from 'rollup'
import { registerVirtualModules } from './virtual-modules'
import { client } from './configs'
import { applyPresets, createRspackConfigContext, getRspackConfig } from './utils/config'
import { dynamicRequire } from './nitro/plugins/dynamic-require'

export const bundle: NuxtBuilder['bundle'] = async (nuxt) => {
  registerVirtualModules()

  const rspackConfigs = [client].map((preset) => {
    const ctx = createRspackConfigContext(nuxt)
    ctx.userConfig = defu(nuxt.options.webpack[`$${preset.name as 'client' | 'server'}`], ctx.userConfig)
    applyPresets(ctx, preset)
    return getRspackConfig(ctx)
  })

  const nitro = useNitro()
  const dynamicRequirePlugin = dynamicRequire({
    dir: resolve(nuxt.options.buildDir, 'dist/server'),
    inline:
      nitro.options.node === false || nitro.options.inlineDynamicImports,
    ignore: [
      'client.manifest.mjs',
      'server.js',
      'server.cjs',
      'server.mjs',
      'server.manifest.mjs',
    ],
  })
  const prerenderRollupPlugins = nitro.options._config.rollupConfig!.plugins as InputPluginOption[]
  const rollupPlugins = nitro.options.rollupConfig!.plugins as InputPluginOption[]

  prerenderRollupPlugins.push(dynamicRequirePlugin)
  rollupPlugins.push(dynamicRequirePlugin)

  await (nuxt as any).callHook('rspack:config', rspackConfigs)

  const compilers = rspackConfigs.map((config) => {
    return rspack(config)
  })

  nuxt.hook('close', async () => {
    for (const compiler of compilers) {
      await new Promise(resolve => compiler.close(resolve))
    }
  })

  await Promise.all(compilers.map((compiler) => {
    return new Promise((resolve) => {
      compiler.run(() => {
        resolve(0)
      })
    })
  }))
}
