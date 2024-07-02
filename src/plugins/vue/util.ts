/**
 * This file is based on Vue.js (MIT) rspack plugins
 * https://github.com/vuejs/vue/blob/dev/src/server/rspack-plugin/util.js
 */

import { logger } from '@nuxt/kit'
import type { Compiler } from '@rspack/core'

export function validate(compiler: Compiler) {
  if (compiler.options.target !== 'node') {
    logger.warn('rspack config `target` should be "node".')
  }

  if (!compiler.options.externals) {
    logger.info(
      'It is recommended to externalize dependencies in the server build for better build performance.',
    )
  }
}

const isJSRegExp = /\.[cm]?js(\?[^.]+)?$/

export const isJS = (file: string) => isJSRegExp.test(file)

export const extractQueryPartJS = (file: string) => isJSRegExp.exec(file)?.[1]

export const isCSS = (file: string) => /\.css(?:\?[^.]+)?$/.test(file)

export const isHotUpdate = (file: string) => file.includes('hot-update')
