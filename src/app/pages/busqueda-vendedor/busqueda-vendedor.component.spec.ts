import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BusquedaVendedorComponent } from './busqueda-vendedor.component';

describe('BusquedaVendedorComponent', () => {
  let component: BusquedaVendedorComponent;
  let fixture: ComponentFixture<BusquedaVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaVendedorComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

