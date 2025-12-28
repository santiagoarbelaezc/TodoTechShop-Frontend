import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionCatalogoComponent } from './presentacion-catalogo.component';

describe('PresentacionCatalogoComponent', () => {
  let component: PresentacionCatalogoComponent;
  let fixture: ComponentFixture<PresentacionCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
