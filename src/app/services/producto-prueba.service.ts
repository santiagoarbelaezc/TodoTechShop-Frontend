import { Injectable } from '@angular/core';
import { ProductoDTO, CategoriaDTO } from '../models/producto.dto';
import { EstadoProducto } from '../models/estado-producto.enum';

@Injectable({
  providedIn: 'root'
})
export class ProductoPruebaService {
  
  // Categorías de ejemplo
  private categorias: CategoriaDTO[] = [
    { id: 1, nombre: 'Smartphones' },
    { id: 2, nombre: 'Laptops' },
    { id: 3, nombre: 'Gaming' },
    { id: 4, nombre: 'Accesorios' }
  ];

  // Productos de ejemplo
  private productosEjemplo: ProductoDTO[] = [
    // Productos iPhone
    {
      id: 1,
      nombre: 'iPhone 13',
      codigo: 'IPH13-001',
      descripcion: 'El iPhone 13 redefine la experiencia smartphone con su revolucionario chip A15 Bionic que ofrece un rendimiento hasta un 50% más rápido que la competencia. Disfruta de una pantalla Super Retina XDR de 6.1 pulgadas con tecnología OLED y brillo máximo de 1200 nits para contenido HDR. El sistema de cámara dual de 12MP incluye estabilización óptica de imagen por desplazamiento de sensor, modo Noche en todas las cámaras, y Estilos Fotográficos personalizados. Con 128GB de almacenamiento interno, resistencia al agua y polvo IP68, y hasta 19 horas de reproducción de video. Incluye compatibilidad con 5G, Ceramic Shield más resistente que cualquier vidrio de smartphone, y diseño de aluminio aerospace-grade con bordes planos y elegantes.',
      precio: 3200000,
      stock: 15,
      categoria: this.categorias[0],
      imagenUrl: 'iphone13.png',
      marca: 'Apple',
      garantia: 12,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 2,
      nombre: 'iPhone 14',
      codigo: 'IPH14-001',
      descripcion: 'El iPhone 14 eleva el estándar con su potente chip A15 Bionic de 5 núcleos GPU y pantalla Super Retina XDR de 6.1 pulgadas con tecnología OLED avanzada. Presenta innovadoras características de seguridad como Detección de Choques que automáticamente llama a emergencias, y SOS de Emergencia vía satélite. El sistema de cámara avanzado incluye un sensor principal de 12MP con píxeles de 1.9 micras para capturar un 49% más de luz, Autofoco más rápido, y modo Acción para videos cinematográficos sin trípode. Batería para todo el día con hasta 20 horas de reproducción de video, 128GB de almacenamiento, resistencia IP68, y diseño en aluminio con durabilidad excepcional. Perfecto para quienes buscan innovación y rendimiento confiable.',
      precio: 3800000,
      stock: 12,
      categoria: this.categorias[0],
      imagenUrl: 'iphone14.png',
      marca: 'Apple',
      garantia: 12,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 3,
      nombre: 'iPhone 14 Pro',
      codigo: 'IPH14P-001',
      descripcion: 'Experimenta la máxima innovación con el iPhone 14 Pro y su revolucionaria Dynamic Island, una nueva forma de interactuar con notificaciones y actividades en tiempo real. Impulsado por el chip A16 Bionic, el más avanzado en un smartphone, con GPU de 5 núcleos y motor neuronal de 16 núcleos. La pantalla Always-On ProMotion de 6.1 pulgadas alcanza un brillo máximo de 2000 nits en exteriores. El sistema de cámara profesional incluye un sensor principal de 48MP con tecnología Quad-Pixel, teleobjetivo de 3x, ultra gran angular, y LiDAR Scanner. Características exclusivas como Always-On Display, Detección de Choques, SOS de Emergencia vía satélite, y hasta 23 horas de batería. Construcción en acero inoxidable surgical-grade con Ceramic Shield y resistencia IP68.',
      precio: 4500000,
      stock: 8,
      categoria: this.categorias[0],
      imagenUrl: 'iphone14pro.png',
      marca: 'Apple',
      garantia: 12,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 4,
      nombre: 'iPhone 15',
      codigo: 'IPH15-001',
      descripcion: 'El iPhone 15 marca el futuro con su transición al puerto USB-C universal, ofreciendo carga más rápida y transferencia de datos hasta 20 veces más veloz. Diseñado con bordes redondeados ergonómicos y fabricado en aluminio con 75% de contenido reciclado. Equipado con el potente chip A16 Bionic y Dynamic Island para una experiencia interactiva única. El sistema de cámara de 48MP con sensor quad-pixel captura detalles increíbles, mientras el ultra gran angular de 12MP expande tus perspectivas creativas. Pantalla Super Retina XDR de 6.1 pulgadas con brillo máximo de 2000 nits, compatibilidad 5G avanzada, y hasta 20 horas de autonomía. Incluye todas las funciones de seguridad como Detección de Choques y SOS de Emergencia vía satélite, en un diseño sostenible y elegante.',
      precio: 4200000,
      stock: 10,
      categoria: this.categorias[0],
      imagenUrl: 'iphone1.png',
      marca: 'Apple',
      garantia: 12,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 5,
      nombre: 'iPhone 15 Pro Max',
      codigo: 'IPH15PM-001',
      descripcion: 'El iPhone 15 Pro Max representa la cúspide de la innovación de Apple con su diseño en titanio aerospace-grade, el material más premium jamás usado en iPhone, que lo hace más ligero y resistente. Impulsado por el revolucionario chip A17 Pro con GPU de 6 núcleos que redefine el rendimiento móvil y el gaming. Cuenta con el sistema de cámara más avanzado: sensor principal de 48MP con teleobjetivo de 5x para el zoom óptico más largo en iPhone, ultra gran angular y LiDAR Scanner. Dynamic Island más intuitiva, Action button personalizable, USB-C con velocidades USB 3 hasta 20 veces más rápidas, y hasta 29 horas de reproducción de video. Resistencia al agua IP68 y Ceramic Shield más resistente.',
      precio: 5200000,
      stock: 6,
      categoria: this.categorias[0],
      imagenUrl: 'iphone2.png',
      marca: 'Apple',
      garantia: 12,
      estado: EstadoProducto.ACTIVO
    },
    // Productos HP
    {
      id: 6,
      nombre: 'HP Pavilion 15',
      codigo: 'HP-PAV15-001',
      descripcion: 'El HP Pavilion 15 combina estilo y rendimiento con su diseño moderno y delgado. Equipado con procesador Intel Core i5 de 12ª generación, 8GB de RAM DDR4 y almacenamiento SSD de 512GB para un arranque y carga de aplicaciones ultrarrápido. Pantalla Full HD de 15.6 pulgadas con biseles micro-edge para una experiencia visual inmersiva. Gráficos Intel Iris Xe para un rendimiento visual excepcional en trabajo y entretenimiento. Incluye teclado completo, WiFi 6, Bluetooth 5.2, y puertos versátiles including USB-C. Ideal para estudiantes, profesionales y uso diario con hasta 8 horas de duración de batería.',
      precio: 2200000,
      stock: 9,
      categoria: this.categorias[1],
      imagenUrl: 'hp1.png',
      marca: 'HP',
      garantia: 24,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 7,
      nombre: 'HP Envy x360',
      codigo: 'HP-ENVY-001',
      descripcion: 'El HP Envy x360 es un convertible 2-en-1 premium con versatilidad excepcional. Con procesador AMD Ryzen 7, 16GB de RAM y almacenamiento SSD NVMe de 1TB para un rendimiento extraordinario. Pantalla táctil Full HD de 13.3 pulgadas que gira 360 grados para usar como laptop, tablet, stand o tienda. Incluye lápiz óptico HP Active Pen para dibujo y toma de notas naturales. Construcción en aluminio premium, bisagra reforzada, y sistema de sonido Bang & Olufsen. Perfecto para creativos, profesionales móviles y quienes buscan potencia y versatilidad en un solo dispositivo.',
      precio: 3500000,
      stock: 6,
      categoria: this.categorias[1],
      imagenUrl: 'hp2.png',
      marca: 'HP',
      garantia: 24,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 8,
      nombre: 'HP Spectre x360',
      codigo: 'HP-SPEC-001',
      descripcion: 'El HP Spectre x360 es la máxima expresión de innovación y diseño premium. Convertible 2-en-1 con procesador Intel Core i7 de 13ª generación, 16GB de RAM LPDDR5 y SSD de 1TB. Pantalla OLED 4K de 13.5 pulgadas con certificación Eyesafe y tasa de refresco de 60Hz. Chasis de aluminio y cobre con detalles cortados con diamante, bisagra gemela de 360 grados y teclado retroiluminado. Incluye HP Pen para creatividad, seguridad con huella dactilar y cámara IR, y batería de larga duración. La elección definitiva para ejecutivos y profesionales exigentes.',
      precio: 5200000,
      stock: 4,
      categoria: this.categorias[1],
      imagenUrl: 'hp3.png',
      marca: 'HP',
      garantia: 36,
      estado: EstadoProducto.ACTIVO
    },
    {
      id: 9,
      nombre: 'HP Omen 16',
      codigo: 'HP-OMEN16-001',
      descripcion: 'La HP Omen 16 es una máquina de gaming de alto rendimiento diseñada para jugadores exigentes. Equipada con procesador Intel Core i7 de 13ª generación, 16GB de RAM DDR5, y tarjeta gráfica NVIDIA GeForce RTX 4060 con 8GB GDDR6. Pantalla QHD de 16.1 pulgadas con tasa de refresco de 165Hz y tecnología Anti-Glare. Almacenamiento ultra rápido con SSD NVMe de 1TB, teclado gaming RGB de 4 zonas, y sistema de enfriamiento mejorado con tubos de calor. Conectividad completa incluyendo Thunderbolt 4, HDMI 2.1, y WiFi 6E. Domina cualquier juego con esta bestia del gaming.',
      precio: 5800000,
      stock: 5,
      categoria: this.categorias[2],
      imagenUrl: 'hp4.png',
      marca: 'HP',
      garantia: 24,
      estado: EstadoProducto.ACTIVO
    }
  ];

  constructor() { }

  // Obtener todos los productos
  obtenerTodosLosProductos(): ProductoDTO[] {
    return [...this.productosEjemplo];
  }

  // Obtener producto por ID
  obtenerProductoPorId(id: number): ProductoDTO | undefined {
    return this.productosEjemplo.find(producto => producto.id === id);
  }

  // Obtener productos por categoría
  obtenerProductosPorCategoria(categoriaId: number): ProductoDTO[] {
    return this.productosEjemplo.filter(producto => producto.categoria.id === categoriaId);
  }

  // Obtener productos por nombre (búsqueda)
  obtenerProductosPorNombre(nombre: string): ProductoDTO[] {
    return this.productosEjemplo.filter(producto => 
      producto.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  // Obtener productos iPhone
  obtenerProductosIphone(): ProductoDTO[] {
    return this.productosEjemplo.filter(p => 
      p.nombre.toLowerCase().includes('iphone') || 
      p.codigo.toLowerCase().includes('iph')
    );
  }

  // Obtener productos HP
  obtenerProductosHp(): ProductoDTO[] {
    return this.productosEjemplo.filter(p => 
      p.nombre.toLowerCase().includes('hp') || 
      p.codigo.toLowerCase().includes('hp')
    );
  }

  // Obtener productos por marca
  obtenerProductosPorMarca(marca: string): ProductoDTO[] {
    return this.productosEjemplo.filter(p => 
      p.marca?.toLowerCase().includes(marca.toLowerCase())
    );
  }

  // Obtener productos en stock
  obtenerProductosEnStock(): ProductoDTO[] {
    return this.productosEjemplo.filter(p => p.stock > 0);
  }

  // Obtener productos con bajo stock
  obtenerProductosBajoStock(limite: number = 5): ProductoDTO[] {
    return this.productosEjemplo.filter(p => p.stock > 0 && p.stock <= limite);
  }

  // Obtener todas las categorías
  obtenerTodasLasCategorias(): CategoriaDTO[] {
    return [...this.categorias];
  }

  // Obtener categoría por ID
  obtenerCategoriaPorId(id: number): CategoriaDTO | undefined {
    return this.categorias.find(categoria => categoria.id === id);
  }

  // Buscar productos por término (nombre, código o marca)
  buscarProductos(termino: string): ProductoDTO[] {
    const terminoLower = termino.toLowerCase();
    return this.productosEjemplo.filter(producto => 
      producto.nombre.toLowerCase().includes(terminoLower) ||
      producto.codigo.toLowerCase().includes(terminoLower) ||
      producto.marca?.toLowerCase().includes(terminoLower) ||
      producto.categoria.nombre.toLowerCase().includes(terminoLower)
    );
  }

  // Obtener productos recomendados (misma categoría, excluyendo el actual)
  obtenerProductosRecomendados(productoId: number, limite: number = 4): ProductoDTO[] {
    const producto = this.obtenerProductoPorId(productoId);
    if (!producto) return [];

    return this.productosEjemplo
      .filter(p => 
        p.categoria.id === producto.categoria.id && 
        p.id !== productoId &&
        p.stock > 0
      )
      .slice(0, limite);
  }
}