import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CarouselImage {
  url: string;
  alt: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.css']
})
export class FeatureComponent implements OnInit, OnDestroy {
  @Input() images: CarouselImage[] = [];
  @Input() autoplay: boolean = true;
  @Input() autoplayInterval: number = 4000; // 4 segundos
  @Input() showDots: boolean = true;
  @Input() showArrows: boolean = true;
  @Input() pauseOnHover: boolean = true;
  @Input() itemsToShow: number = 3; // Tarjetas visibles por defecto

  currentIndex: number = 0;
  isAnimating: boolean = false;
  autoplayTimer: any;
  isHovering: boolean = false;

  ngOnInit(): void {
    if (this.autoplay && this.images.length > 1) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  // Navegación
  next(): void {
    if (this.isAnimating || this.images.length <= 1) return;
    
    this.isAnimating = true;
    const nextIndex = this.currentIndex + 1;
    this.currentIndex = nextIndex >= this.images.length ? 0 : nextIndex;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  prev(): void {
    if (this.isAnimating || this.images.length <= 1) return;
    
    this.isAnimating = true;
    const prevIndex = this.currentIndex - 1;
    this.currentIndex = prevIndex < 0 ? this.images.length - 1 : prevIndex;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  goToSlide(index: number): void {
    if (this.isAnimating || index === this.currentIndex || index < 0 || index >= this.images.length) return;
    
    this.isAnimating = true;
    this.currentIndex = index;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  // Calcula transformación para el track
  get trackTransform(): string {
    const cardWidth = 100 / this.itemsToShow;
    const offset = this.currentIndex * cardWidth;
    return `translateX(-${offset}%)`;
  }

  // Autoplay
  startAutoplay(): void {
    this.stopAutoplay();
    
    this.autoplayTimer = setInterval(() => {
      if (!this.isHovering || !this.pauseOnHover) {
        this.next();
      }
    }, this.autoplayInterval);
  }

  stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
    }
  }

  // Eventos de hover
  onMouseEnter(): void {
    this.isHovering = true;
    if (this.pauseOnHover) {
      this.stopAutoplay();
    }
  }

  onMouseLeave(): void {
    this.isHovering = false;
    if (this.pauseOnHover && this.autoplay) {
      this.startAutoplay();
    }
  }

  // Responsive items to show
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth < 768) {
      this.itemsToShow = 1;
    } else if (window.innerWidth < 1024) {
      this.itemsToShow = 2;
    } else {
      this.itemsToShow = 3;
    }
  }
}