import { defineNuxtModule } from '@nuxt/kit'
import { bundle } from './rspack'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'rspack',
    configKey: 'rspack',
  },

  defaults: {},
  setup(_, nuxt) {
    nuxt.options.builder = { bundle }
  },
})
