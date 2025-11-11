import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BuscarInicioComponent } from './buscar-inicio.component';

describe('BuscarInicioComponent', () => {
  let component: BuscarInicioComponent;
  let fixture: ComponentFixture<BuscarInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarInicioComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

