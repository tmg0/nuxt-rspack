import fse from 'fs-extra'
import type { NuxtBuilder } from 'nuxt/schema'
import { useNuxt } from '@nuxt/kit'
import { type Compiler, rspack } from '@rspack/core'
import { resolve } from 'pathe'
import { registerVirtualModules } from './virtual-modules'
import { client } from './configs'
import { applyPresets, createRspackConfigContext, getRspackConfig } from './utils/config'

export const bundle: NuxtBuilder['bundle'] = async (nuxt) => {
  registerVirtualModules()

  const rspackConfigs = [client].map((preset) => {
    const ctx = createRspackConfigContext(nuxt)
    applyPresets(ctx, preset)
    return getRspackConfig(ctx)
  })

  await nuxt.callHook('webpack:config', rspackConfigs as any)

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
