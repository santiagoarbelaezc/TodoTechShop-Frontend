// Configuración de rutas con tipos específicos
export interface RouteConfig {
  duration: number;
  offset: number;
  delay: number;
  easing: string;
  once: boolean;
  mirror?: boolean;
  disable?: boolean | string;
}

export interface AosConfig {
  global: RouteConfig;
  routes: Record<string, RouteConfig>;
  elements: {
    banner: {
      animation: string;
      duration: number;
      delay: number;
    };
    card: {
      animation: string;
      duration: number;
      delay: string | number;
    };
    section: {
      animation: string;
      duration: number;
      delay: number;
    };
    promo: {
      animation: string;
      duration: number;
      delay: string | number;
    };
  };
}

// Configuración principal
export const aosConfig: AosConfig = {
  // Configuración global por defecto
  global: {
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    delay: 100,
    mirror: false,
    disable: false
  },
  
  // Configuración específica por ruta
  routes: {
    '/catalogo': {
      duration: 900,
      offset: 120,
      delay: 150,
      easing: 'ease-out-cubic',
      once: true
    },
    '/inicio': {
      duration: 700,
      offset: 80,
      delay: 100,
      easing: 'ease-out-cubic',
      once: true
    },
    '/descripcion-cliente': {
      duration: 1000,
      offset: 150,
      delay: 200,
      easing: 'ease-out-cubic',
      once: false
    },
    '/login': {
      duration: 600,
      offset: 60,
      delay: 80,
      easing: 'ease-out-cubic',
      once: true
    }
  },
  
  // Configuración por tipo de elemento
  elements: {
    banner: {
      animation: 'zoom-in',
      duration: 1200,
      delay: 200
    },
    card: {
      animation: 'fade-up',
      duration: 600,
      delay: 'staggered'
    },
    section: {
      animation: 'fade-up',
      duration: 800,
      delay: 100
    },
    promo: {
      animation: 'flip-left',
      duration: 600,
      delay: 'staggered'
    }
  }
};

// Función helper para obtener configuración de ruta
export function getRouteConfig(route: string): RouteConfig {
  return aosConfig.routes[route] || aosConfig.global;
}

// Tipos de animaciones disponibles
export const aosAnimations = {
  fade: [
    'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right',
    'fade-up-right', 'fade-up-left', 'fade-down-right', 'fade-down-left'
  ],
  zoom: [
    'zoom-in', 'zoom-in-up', 'zoom-in-down', 'zoom-in-left', 'zoom-in-right',
    'zoom-out', 'zoom-out-up', 'zoom-out-down', 'zoom-out-left', 'zoom-out-right'
  ],
  slide: ['slide-up', 'slide-down', 'slide-left', 'slide-right'],
  flip: ['flip-left', 'flip-right', 'flip-up', 'flip-down']
} as const;

// Configuración para dispositivos móviles
export const mobileConfig: Partial<RouteConfig> = {
  duration: 600,
  offset: 50,
  delay: 50,
  disable: false
};