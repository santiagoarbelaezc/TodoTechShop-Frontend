import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarOrdenComponent } from './navbar-orden.component';

describe('NavbarOrdenComponent', () => {
  let component: NavbarOrdenComponent;
  let fixture: ComponentFixture<NavbarOrdenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarOrdenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarOrdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
