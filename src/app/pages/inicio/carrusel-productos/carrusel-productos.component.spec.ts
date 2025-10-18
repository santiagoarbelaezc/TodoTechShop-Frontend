import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselProductosComponent } from './carrusel-productos.component';

describe('CarruselProductosComponent', () => {
  let component: CarruselProductosComponent;
  let fixture: ComponentFixture<CarruselProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselProductosComponent]
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
