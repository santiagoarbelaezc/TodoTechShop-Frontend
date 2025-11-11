import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Agregar esto

import { ReporteComponent } from './reporte.component';

describe('ReporteComponent', () => {
  let component: ReporteComponent;
  let fixture: ComponentFixture<ReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReporteComponent,
        HttpClientTestingModule // ← SOLO AGREGAR ESTA LÍNEA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});