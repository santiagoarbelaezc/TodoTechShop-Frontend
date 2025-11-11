import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LaptopsComponent } from './laptops.component';

describe('LaptopsComponent', () => {
  let component: LaptopsComponent;
  let fixture: ComponentFixture<LaptopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaptopsComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaptopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

