import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaInicioComponent } from './caja-inicio.component';

describe('CajaInicioComponent', () => {
  let component: CajaInicioComponent;
  let fixture: ComponentFixture<CajaInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
