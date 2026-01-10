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
    browsers: ['ChromeHeadless'], // Cambiado para CI/CD
    singleRun: true, // Cambiado a true para CI/CD
    restartOnFileChange: true,
    
    // CONFIGURACIÓN PARA IGNORAR ARCHIVOS CSS (SOLUCIÓN AL ERROR)
    webpack: {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: 'null-loader'
              }
            ]
          },
          {
            test: /\.scss$/,
            use: [
              {
                loader: 'null-loader'
              }
            ]
          },
          {
            test: /\.sass$/,
            use: [
              {
                loader: 'null-loader'
              }
            ]
          },
          {
            test: /\.less$/,
            use: [
              {
                loader: 'null-loader'
              }
            ]
          }
        ]
      },
      resolve: {
        fallback: {
          // Evita problemas con módulos que no se necesitan en pruebas
          "fs": false,
          "path": false,
          "os": false
        }
      }
    },
    
    // Otra opción: excluir archivos específicos
    exclude: [
      // Si quieres excluir archivos específicos del directorio src
      // 'src/**/*.spec.ts',
      // 'src/test.ts'
    ],
    
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