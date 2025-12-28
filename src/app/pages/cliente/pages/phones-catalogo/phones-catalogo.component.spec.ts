import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhonesCatalogoComponent } from './phones-catalogo.component';

describe('PhonesCatalogoComponent', () => {
  let component: PhonesCatalogoComponent;
  let fixture: ComponentFixture<PhonesCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhonesCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhonesCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
