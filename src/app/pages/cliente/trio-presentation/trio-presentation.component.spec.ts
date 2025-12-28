import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrioPresentationComponent } from './trio-presentation.component';

describe('TrioPresentationComponent', () => {
  let component: TrioPresentationComponent;
  let fixture: ComponentFixture<TrioPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrioPresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrioPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
