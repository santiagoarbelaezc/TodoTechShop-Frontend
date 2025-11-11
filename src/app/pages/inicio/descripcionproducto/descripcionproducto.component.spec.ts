import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router'; // Agregar esta importación

import { DescripcionproductoComponent } from './descripcionproducto.component';

describe('DescripcionproductoComponent', () => {
  let component: DescripcionproductoComponent;
  let fixture: ComponentFixture<DescripcionproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionproductoComponent, HttpClientTestingModule],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { 
              paramMap: { 
                get: () => '123' // O el ID del producto que espera tu componente
              } 
            } 
          } 
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});