import { Component, OnInit, OnDestroy, inject, AfterViewInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarInicioComponent } from '../navbar-inicio/navbar-inicio.component';
import { ProductoDTO, CategoriaDTO } from '../../../models/producto.dto';
import { ProductoService } from '../../../services/producto.service';

// Interfaz extendida para incluir la propiedad imagen
interface ProductoConImagen extends ProductoDTO {
  imagen: string;
}

@Component({
  selector: 'app-descripcionproducto',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarInicioComponent],
  templateUrl: './descripcionproducto.component.html',
  styleUrls: ['./descripcionproducto.component.css']
})
export class DescripcionproductoComponent implements OnInit, OnDestroy, AfterViewInit {
  private productoService = inject(ProductoService);

  producto: ProductoConImagen | null = null;
  productosRecomendados: ProductoConImagen[] = [];
  quantity: number = 1;

  // Productos de ejemplo con propiedad imagen
  private productosEjemplo: ProductoConImagen[] = [
    {
      id: 1,
      nombre: 'iPhone 13',
      codigo: 'IPH13-001',
      descripcion: 'iPhone 13 con 128GB de almacenamiento, pantalla Super Retina XDR de 6.1 pulgadas, chip A15 Bionic, sistema de cámara dual de 12MP con modo Noche y Estilos Fotográficos. Resistente al agua y polvo IP68.',
      precio: 3200000,
      stock: 15,
      categoria: { id: 1, nombre: 'Smartphones' },
      imagenUrl: 'iphone13.png',
      imagen: 'iphone13.png'
    },
    {
      id: 2,
      nombre: 'iPhone 14',
      codigo: 'IPH14-001',
      descripcion: 'iPhone 14 con pantalla Super Retina XDR de 6.1 pulgadas, chip A15 Bionic, sistema de cámara avanzado con modo Acción y Detección de Choques. Batería para todo el día.',
      precio: 3800000,
      stock: 12,
      categoria: { id: 1, nombre: 'Smartphones' },
      imagenUrl: 'iphone14.png',
      imagen: 'iphone14.png'
    },
    {
      id: 3,
      nombre: 'iPhone 14 Pro',
      codigo: 'IPH14P-001',
      descripcion: 'iPhone 14 Pro con Dynamic Island, pantalla Always-On, cámara principal de 48MP, chip A16 Bionic y Detección de Choques. La experiencia iPhone más avanzada.',
      precio: 4500000,
      stock: 8,
      categoria: { id: 1, nombre: 'Smartphones' },
      imagenUrl: 'iphone14pro.png',
      imagen: 'iphone14pro.png'
    },
    {
      id: 4,
      nombre: 'iPhone 15',
      codigo: 'IPH15-001',
      descripcion: 'Nuevo iPhone 15 con USB-C, diseño con bordes redondeados, chip A16 Bionic, cámara de 48MP y Dynamic Island. Carga más versátil y rápida.',
      precio: 4200000,
      stock: 10,
      categoria: { id: 1, nombre: 'Smartphones' },
      imagenUrl: 'iphone1.png',
      imagen: 'iphone1.png'
    },
    {
      id: 5,
      nombre: 'iPhone 15 Pro Max',
      codigo: 'IPH15PM-001',
      descripcion: 'iPhone 15 Pro Max 256GB con titanio, el iPhone más avanzado. Cámara de 48MP con zoom de 5x, chip A17 Pro, Action button y USB-C.',
      precio: 5200000,
      stock: 6,
      categoria: { id: 1, nombre: 'Smartphones' },
      imagenUrl: 'iphone2.png',
      imagen: 'iphone2.png'
    },
    {
      id: 6,
      nombre: 'HP Pavilion 15',
      codigo: 'HP-PAV15-001',
      descripcion: 'HP Pavilion 15.6" con Intel Core i5, 8GB RAM, 512GB SSD, gráficos Intel Iris Xe. Ideal para trabajo y entretenimiento con diseño moderno y ligero.',
      precio: 2200000,
      stock: 9,
      categoria: { id: 2, nombre: 'Laptops' },
      imagenUrl: 'hp1.png',
      imagen: 'hp1.png'
    },
    {
      id: 7,
      nombre: 'HP Envy x360',
      codigo: 'HP-ENVY-001',
      descripcion: 'HP Envy x360 convertible 2-en-1 con AMD Ryzen 7, 16GB RAM, 1TB SSD, pantalla táctil Full HD. Versátil y potente para creativos y profesionales.',
      precio: 3500000,
      stock: 6,
      categoria: { id: 2, nombre: 'Laptops' },
      imagenUrl: 'hp2.png',
      imagen: 'hp2.png'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Scroll inmediato al inicio
    this.scrollToTop();
    this.loadProduct();
  }

  ngAfterViewInit(): void {
    // Scroll adicional para asegurar que esté en la parte superior
    setTimeout(() => this.scrollToTop(), 100);
  }

  ngOnDestroy(): void {
    // Limpiar suscripción si existe
  }

  private scrollToTop(): void {
    // Método 1: Usando ViewportScroller (recomendado)
    this.viewportScroller.scrollToPosition([0, 0]);
    
    // Método 2: Alternativa con window.scrollTo
    // window.scrollTo(0, 0);
  }

  private loadProduct(): void {
    // PRIMERO: Intentar obtener el producto del servicio
    const productoSeleccionado = this.productoService.obtenerProductoSeleccionado();
    
    if (productoSeleccionado) {
      console.log('Producto obtenido del servicio:', productoSeleccionado.nombre);
      // Convertir ProductoDTO a ProductoConImagen
      this.producto = this.convertirProductoConImagen(productoSeleccionado);
      this.loadRecommendedProducts();
      // Scroll al top después de cargar el producto
      setTimeout(() => this.scrollToTop(), 50);
    } else {
      // SEGUNDO: Si no hay producto en el servicio, intentar obtenerlo por ID de la ruta
      const productId = this.route.snapshot.paramMap.get('id');
      
      if (productId) {
        const id = parseInt(productId, 10);
        this.producto = this.productosEjemplo.find(p => p.id === id) || null;
        
        if (this.producto) {
          console.log('Producto obtenido por ID:', this.producto.nombre);
          this.loadRecommendedProducts();
          // Scroll al top después de cargar el producto
          setTimeout(() => this.scrollToTop(), 50);
        } else {
          console.warn('Producto no encontrado por ID, redirigiendo...');
          this.router.navigate(['/inicio']);
        }
      } else {
        // TERCERO: Si no hay ID en la ruta, redirigir al inicio
        console.warn('No se proporcionó ID de producto, redirigiendo...');
        this.router.navigate(['/inicio']);
      }
    }
  }

  private convertirProductoConImagen(producto: ProductoDTO): ProductoConImagen {
    // Si el producto ya tiene imagen, usarla, sino usar imagenUrl
    const productoConImagen: any = { ...producto };
    if (!productoConImagen.imagen && productoConImagen.imagenUrl) {
      productoConImagen.imagen = productoConImagen.imagenUrl;
    }
    return productoConImagen as ProductoConImagen;
  }

  private loadRecommendedProducts(): void {
    if (!this.producto) return;

    // Filtrar productos de la misma categoría, excluyendo el actual
    this.productosRecomendados = this.productosEjemplo
      .filter(p => p.categoria.id === this.producto!.categoria.id && p.id !== this.producto!.id)
      .slice(0, 4);
  }

  increaseQuantity(): void {
    if (this.producto && this.quantity < this.producto.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.producto && this.producto.stock > 0) {
      console.log(`Agregando ${this.quantity} ${this.producto.nombre} al carrito`);
      alert(`${this.quantity} ${this.producto.nombre} agregado(s) al carrito`);
    }
  }

  viewProduct(producto: ProductoConImagen): void {
    // Almacenar el nuevo producto seleccionado en el servicio
    this.productoService.seleccionarProducto(producto);
    
    // Recargar el componente con el nuevo producto
    this.producto = producto;
    this.quantity = 1;
    this.loadRecommendedProducts();
    
    // Scroll to top para mejor experiencia de usuario
    this.scrollToTop();
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }

  goHome(): void {
    this.router.navigate(['/inicio']);
  }
}