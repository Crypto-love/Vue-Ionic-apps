const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function (ctx) {
  return {
    boot: ['init', 'i18n', 'apollo', 'filters'],
    css: ['material_layout.css', 'text.css', 'material_dashboard.css', 'my.css'],
    extras: [
      'mdi-v4',
      'eva-icons',
      'line-awesome',
      'fontawesome-v5',
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
      'material-icons-outlined'
    ],
    framework: {
      iconSet: 'material-icons',
      lang: 'en-us',
      cssAddon: true,
      all: 'auto',
      components: [],
      directives: [],
      plugins: ['Dialog', 'Notify', 'Loading'],
      config: {
        notify: { position: 'top' },
        capacitor: {
          backButtonExit: true,
          backButton: true
        },
        cordova: {
          backButtonExit: true,
          backButton: true
        }
      }
    },
    supportIE: false,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      showProgress: true,
      gzip: false,
      analyze: false,
      extractCSS: false,
      minify: true,
      extendWebpack(cfg) {
        cfg.resolve.alias = {
          app: path.resolve(__dirname, './'),
          src: path.resolve(__dirname, './src'),
          boot: path.resolve(__dirname, './src/boot'),
          assets: path.resolve(__dirname, './src/assets'),
          statics: path.resolve(__dirname, './src/statics'),
          pages: path.resolve(__dirname, './src/modules'),
          components: path.resolve(__dirname, './src/modules'),
          web: path.resolve(__dirname, './src/modules/web'),
          services: path.resolve(__dirname, './src/modules/services/index'),
          treeGQL: path.resolve(__dirname, './src/modules/services/share/src/graphql')
        };
        if (process.env.CI) {
          // Set terser parallel threads explicitly in CI mode to avoid memory overrun
          cfg.optimization.minimize = true;
          cfg.optimization.minimizer = [
            new TerserPlugin({
              parallel: 2
            })
          ];
        }
      }
    },
    devServer: {
      https: false,
      port: 8080,
      open: true // opens browser window automatically
    },
    animations: [],
    ssr: {
      pwa: false
    },
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true
      }, // only for GenerateSW
      manifest: {
        name: 'Treedots',
        short_name: 'Treedots',
        description:
          'TreeDots was conceptualised in 2017 - a food supplies redistributor with the motive to reduce food waste while providing cheap food supplies for businesses.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },
    cordova: {
      id: 'com.thetreedots'
    },
    capacitor: {
      hideSplashscreen: true
    },
    electron: {
      bundler: 'packager', // 'packager' or 'builder'
      packager: {},
      builder: {
        appId: 'treedots-core'
      },
      nodeIntegration: true,
      extendWebpack(cfg) {}
    }
  };
};
