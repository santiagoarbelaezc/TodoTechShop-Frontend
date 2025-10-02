import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarInicioComponent } from './buscar-inicio.component';

describe('BuscarInicioComponent', () => {
  let component: BuscarInicioComponent;
  let fixture: ComponentFixture<BuscarInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarInicioComponent]
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
