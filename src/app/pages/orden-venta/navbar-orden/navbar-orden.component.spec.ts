import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NavbarOrdenComponent } from './navbar-orden.component';

describe('NavbarOrdenComponent', () => {
  let component: NavbarOrdenComponent;
  let fixture: ComponentFixture<NavbarOrdenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarOrdenComponent, HttpClientTestingModule]
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

