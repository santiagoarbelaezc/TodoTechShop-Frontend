import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselInteresComponent } from './carrusel-interes.component';

describe('CarruselInteresComponent', () => {
  let component: CarruselInteresComponent;
  let fixture: ComponentFixture<CarruselInteresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselInteresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselInteresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
