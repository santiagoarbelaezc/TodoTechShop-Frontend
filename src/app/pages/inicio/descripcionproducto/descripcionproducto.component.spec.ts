import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescripcionproductoComponent } from './descripcionproducto.component';

describe('DescripcionproductoComponent', () => {
  let component: DescripcionproductoComponent;
  let fixture: ComponentFixture<DescripcionproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
