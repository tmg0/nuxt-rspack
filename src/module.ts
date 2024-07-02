import { defineNuxtModule } from '@nuxt/kit'
import type { HookResult } from 'nuxt/schema'
import { bundle } from './rspack'

declare module '#app' {
  interface NuxtHooks {
    'rspack:compile': () => HookResult
  }
}

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'rspack',
    configKey: 'rspack',
  },

  defaults: {},
  setup(_, nuxt) {
    nuxt.options.builder = {
      bundle,
    }
  },
})
