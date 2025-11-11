import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Agregar esto

import { AccesoriosComponent } from './accesorios.component';

describe('AccesoriosComponent', () => {
  let component: AccesoriosComponent;
  let fixture: ComponentFixture<AccesoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AccesoriosComponent,
        HttpClientTestingModule // ← SOLO AGREGAR ESTA LÍNEA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});