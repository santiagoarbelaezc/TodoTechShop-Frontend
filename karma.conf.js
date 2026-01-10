// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Puedes añadir configuración de jasmine aquí
        // random: false, // Desactiva la ejecución aleatoria
      },
      clearContext: false // deja visible el resultado en el navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true // elimina los trazos duplicados
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    restartOnFileChange: true,
    
    // CONFIGURACIÓN PARA IGNORAR ARCHIVOS CSS DE AOS DURANTE PRUEBAS
    webpack: {
      module: {
        rules: [
          // Ignorar CSS de AOS usando null-loader - ruta específica
          {
            test: /node_modules[\\\/]aos[\\\/]dist[\\\/]aos\.css$/,
            use: 'null-loader'
          },
          // Procesar otros archivos CSS
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
          },
          {
            test: /\.sass$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
          },
          {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader']
          }
        ]
      },
      resolve: {
        fallback: {
          "fs": false,
          "path": false,
          "os": false
        }
      }
    },
    
    // Configuración para ChromeHeadless
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--remote-debugging-port=9222',
          '--disable-dev-shm-usage'
        ]
      }
    }
  });
};