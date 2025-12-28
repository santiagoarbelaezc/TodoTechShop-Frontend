import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamingCatalogoComponent } from './gaming-catalogo.component';

describe('GamingCatalogoComponent', () => {
  let component: GamingCatalogoComponent;
  let fixture: ComponentFixture<GamingCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamingCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamingCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
