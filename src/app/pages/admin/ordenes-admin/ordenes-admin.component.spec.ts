import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Agregar esto

import { OrdenesAdminComponent } from './ordenes-admin.component';

describe('OrdenesAdminComponent', () => {
  let component: OrdenesAdminComponent;
  let fixture: ComponentFixture<OrdenesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrdenesAdminComponent,
        HttpClientTestingModule // ← SOLO AGREGAR ESTA LÍNEA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});