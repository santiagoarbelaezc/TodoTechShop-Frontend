// Mock para AOS - Esto previene errores durante las pruebas
(window as any).AOS = {
  init: () => {},
  refresh: () => {},
  refreshHard: () => {}
};

// Mock para CSS si es necesario
if (!window.CSS) {
  (window as any).CSS = {
    supports: () => false
  };
}

// Configuración global para Jasmine
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;