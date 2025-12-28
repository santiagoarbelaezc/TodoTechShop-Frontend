import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaptopsCatalogoComponent } from './laptops-catalogo.component';

describe('LaptopsCatalogoComponent', () => {
  let component: LaptopsCatalogoComponent;
  let fixture: ComponentFixture<LaptopsCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaptopsCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaptopsCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
