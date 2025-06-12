const path = require('path');
module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set(
      'vue$',
      // If using the runtime only build
      path.resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js')
      // Or if using full build of Vue (runtime + compiler)
      // path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js')
    )
  },
  "transpileDependencies": [
    "vuetify"
  ],
  "outputDir": "../wwwroot",
  runtimeCompiler: true,
  filenameHashing: true,
  configureWebpack: {
    optimization: {
      splitChunks: false
    }
  },
  css: {

    loaderOptions: {
      sass: {
        // sass-loader >= 8
        additionalData: `@import "~@/scss/main.sass"`,
      },

    },
  },
}