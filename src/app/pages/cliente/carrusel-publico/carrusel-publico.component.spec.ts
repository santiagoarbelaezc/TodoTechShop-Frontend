import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselPublicoComponent } from './carrusel-publico.component';

describe('CarruselPublicoComponent', () => {
  let component: CarruselPublicoComponent;
  let fixture: ComponentFixture<CarruselPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselPublicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
