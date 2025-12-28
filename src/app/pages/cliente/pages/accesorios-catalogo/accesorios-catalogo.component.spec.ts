import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesoriosCatalogoComponent } from './accesorios-catalogo.component';

describe('AccesoriosCatalogoComponent', () => {
  let component: AccesoriosCatalogoComponent;
  let fixture: ComponentFixture<AccesoriosCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesoriosCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesoriosCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
