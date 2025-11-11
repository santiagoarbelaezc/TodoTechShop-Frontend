import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Agregar esto

import { AccesoDenegadoComponent } from './acceso-denegado.component';

describe('AccesoDenegadoComponent', () => {
  let component: AccesoDenegadoComponent;
  let fixture: ComponentFixture<AccesoDenegadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AccesoDenegadoComponent,
        HttpClientTestingModule // ← SOLO AGREGAR ESTA LÍNEA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesoDenegadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});