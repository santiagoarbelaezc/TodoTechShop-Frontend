import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioCatalogoComponent } from './inicio-catalogo.component';

describe('InicioCatalogoComponent', () => {
  let component: InicioCatalogoComponent;
  let fixture: ComponentFixture<InicioCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
