import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GamingComponent } from './gaming.component';

describe('GamingComponent', () => {
  let component: GamingComponent;
  let fixture: ComponentFixture<GamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamingComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

