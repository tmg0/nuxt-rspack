import { type RspackConfigContext, applyPresets } from '../utils/config'
import { getPostcssConfig } from '../utils/postcss'

export function style(ctx: RspackConfigContext) {
  applyPresets(ctx, [
    loaders,
  ])
}

function loaders(ctx: RspackConfigContext) {
  // CSS
  ctx.config.module!.rules!.push(createdStyleRule('css', /\.css$/i, null, ctx))

  // PostCSS
  ctx.config.module!.rules!.push(createdStyleRule('postcss', /\.p(ost)?css$/i, null, ctx))

  // Less
  const lessLoader = { loader: 'less-loader' }
  ctx.config.module!.rules!.push(createdStyleRule('less', /\.less$/i, lessLoader, ctx))

  // Sass (TODO: optional dependency)
  const sassLoader = { loader: 'sass-loader' }
  ctx.config.module!.rules!.push(createdStyleRule('sass', /\.sass$/i, sassLoader, ctx))

  const scssLoader = { loader: 'sass-loader' }
  ctx.config.module!.rules!.push(createdStyleRule('scss', /\.scss$/i, scssLoader, ctx))

  // Stylus
  const stylusLoader = { loader: 'stylus-loader' }
  ctx.config.module!.rules!.push(createdStyleRule('stylus', /\.styl(us)?$/i, stylusLoader, ctx))
}

function createdStyleRule(lang: string, test: RegExp, processorLoader: any, ctx: RspackConfigContext) {
  const styleLoaders = [
    createPostcssLoadersRule(ctx),
    processorLoader,
  ].filter(Boolean)

  const cssLoaders = createCssLoadersRule(ctx, {})
  const cssModuleLoaders = createCssLoadersRule(ctx, {})

  return {
    test,
    oneOf: [
      // This matches <style module>
      {
        resourceQuery: /module/,
        use: cssModuleLoaders.concat(styleLoaders),
      },
      // This matches plain <style> or <style scoped>
      {
        use: cssLoaders.concat(styleLoaders),
      },
    ],
  }
}

function createCssLoadersRule(ctx: RspackConfigContext, cssLoaderOptions: any) {
  const cssLoader = { loader: 'css-loader', options: cssLoaderOptions }

  return [
    // https://github.com/vuejs/vue-style-loader/issues/56
    // {
    //   loader: 'vue-style-loader',
    //   options: options.webpack.loaders.vueStyle
    // },
    cssLoader,
  ]
}

function createPostcssLoadersRule(ctx: RspackConfigContext) {
  if (!ctx.options.postcss)
    return

  const config = getPostcssConfig(ctx.nuxt)

  if (!config) {
    return
  }

  return {
    loader: 'postcss-loader',
    options: config,
  }
}
