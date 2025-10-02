import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarInicioComponent } from './navbar-inicio.component';

describe('NavbarInicioComponent', () => {
  let component: NavbarInicioComponent;
  let fixture: ComponentFixture<NavbarInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
