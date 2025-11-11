import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CarruselProductosComponent } from './carrusel-productos.component';

describe('CarruselProductosComponent', () => {
  let component: CarruselProductosComponent;
  let fixture: ComponentFixture<CarruselProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselProductosComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

