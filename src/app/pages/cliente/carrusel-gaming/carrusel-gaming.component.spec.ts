import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselGamingComponent } from './carrusel-gaming.component';

describe('CarruselGamingComponent', () => {
  let component: CarruselGamingComponent;
  let fixture: ComponentFixture<CarruselGamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselGamingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselGamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
