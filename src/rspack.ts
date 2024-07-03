import fse from 'fs-extra'
import type { NuxtBuilder } from 'nuxt/schema'
import { useNitro, useNuxt } from '@nuxt/kit'
import { type Compiler, rspack } from '@rspack/core'
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

  await nuxt.callHook('webpack:config', rspackConfigs as any)

  prerenderRollupPlugins.push(dynamicRequirePlugin)
  rollupPlugins.push(dynamicRequirePlugin)

  const compilers = rspackConfigs.map((config) => {
    return rspack(config)
  })

  nuxt.hook('close', async () => {
    for (const compiler of compilers) {
      await new Promise(resolve => compiler.close(resolve))
    }
  })

  for (const c of compilers) {
    await compile(c)
  }
}

async function compile(compiler: Compiler) {
  const nuxt = useNuxt()
  await nuxt.callHook('webpack:compile', { name: compiler.options.name!, compiler: compiler as any })

  // Load renderer resources after build
  compiler.hooks.done.tap('load-resources', async () => {
    await nuxt.callHook('webpack:compiled', {} as any)
  })

  const path = resolve(nuxt.options.buildDir, 'dist/server/styles.mjs')
  await fse.ensureFile(path)
  await fse.outputFile(path, 'export default {}')

  await new Promise((resolve, reject) => compiler.run((err, stats) => err ? reject(err) : resolve(stats!)))
}
