import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Agregar esto

import { CreacionComponent } from './creacion.component';

describe('CreacionComponent', () => {
  let component: CreacionComponent;
  let fixture: ComponentFixture<CreacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreacionComponent,
        HttpClientTestingModule // ← SOLO AGREGAR ESTA LÍNEA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});