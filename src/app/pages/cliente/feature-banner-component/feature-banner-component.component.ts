import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import AOS from 'aos';
import 'aos/dist/aos.css';

@Component({
  selector: 'app-feature-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-banner-component.component.html',
  styleUrls: ['./feature-banner-component.component.css']
})
export class FeatureBannerComponent implements OnInit {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() primaryText: string = 'Más información';
  @Input() reverse: boolean = false;
  @Input() backgroundColor: string =
    'linear-gradient(135deg, #f8f9fa 0%, #f0f1f3 100%)';
  @Input() textColor: string = '#1d1d1f'; // 👉 nuevo input para color de texto

  ngOnInit(): void {
    AOS.init({
      duration: 900,
      once: true,
      offset: 120
    });
  }
}
