import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarCajaComponent } from './navbar-caja.component';

describe('NavbarCajaComponent', () => {
  let component: NavbarCajaComponent;
  let fixture: ComponentFixture<NavbarCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
