import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureBannerComponentComponent } from './feature-banner-component.component';

describe('FeatureBannerComponentComponent', () => {
  let component: FeatureBannerComponentComponent;
  let fixture: ComponentFixture<FeatureBannerComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureBannerComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureBannerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
