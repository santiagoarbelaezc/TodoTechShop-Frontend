import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DescripcionCatalogoComponent } from './descripcion-catalogo.component';

describe('DescripcionCatalogoComponent', () => {
  let component: DescripcionCatalogoComponent;
  let fixture: ComponentFixture<DescripcionCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionCatalogoComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
