import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Agregar esto

import { TablaUsuariosComponent } from './tabla-usuarios.component';

describe('TablaUsuariosComponent', () => {
  let component: TablaUsuariosComponent;
  let fixture: ComponentFixture<TablaUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TablaUsuariosComponent,
        HttpClientTestingModule // ← SOLO AGREGAR ESTA LÍNEA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});