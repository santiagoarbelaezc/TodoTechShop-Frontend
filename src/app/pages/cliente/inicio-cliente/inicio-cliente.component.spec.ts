import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { InicioClienteComponent } from './inicio-cliente.component';

describe('InicioClienteComponent', () => {
  let component: InicioClienteComponent;
  let fixture: ComponentFixture<InicioClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioClienteComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

