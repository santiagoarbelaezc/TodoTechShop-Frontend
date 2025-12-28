import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterClienteComponent } from './footer-cliente.component';

describe('FooterClienteComponent', () => {
  let component: FooterClienteComponent;
  let fixture: ComponentFixture<FooterClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
