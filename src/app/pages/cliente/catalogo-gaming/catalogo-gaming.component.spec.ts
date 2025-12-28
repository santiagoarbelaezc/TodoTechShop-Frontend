import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoGamingComponent } from './catalogo-gaming.component';

describe('CatalogoGamingComponent', () => {
  let component: CatalogoGamingComponent;
  let fixture: ComponentFixture<CatalogoGamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoGamingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoGamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
