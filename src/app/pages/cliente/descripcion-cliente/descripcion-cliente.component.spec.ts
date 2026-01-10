import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DescripcionClienteComponent } from './descripcion-cliente.component';

describe('DescripcionClienteComponent', () => {
  let component: DescripcionClienteComponent;
  let fixture: ComponentFixture<DescripcionClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionClienteComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
