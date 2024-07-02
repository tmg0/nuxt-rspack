import { useNuxt } from '@nuxt/kit'
import { RspackVirtualModulePlugin } from 'rspack-plugin-virtual-module'

export function registerVirtualModules() {
  const nuxt = useNuxt()

  // Initialize virtual modules instance
  const vmp = new RspackVirtualModulePlugin(nuxt.vfs)
  const writeFiles = () => {
    for (const filePath in nuxt.vfs) {
      vmp.writeModule(filePath, nuxt.vfs[filePath] || '')
    }
  }

  // Workaround to initialize virtual modules
  (nuxt as any).hook('rspack:compile', ({ compiler }) => {
    if (compiler.name === 'server')
      writeFiles()
  })

  // Update virtual modules when templates are updated
  nuxt.hook('app:templatesGenerated', writeFiles)

  ; (nuxt as any).hook('rspack:config', (configs: any) => configs.forEach((config: any) => {
    // Support virtual modules (input)
    config.plugins!.push(vmp)
  }))
}
