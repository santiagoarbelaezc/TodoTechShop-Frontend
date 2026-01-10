import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CatalogoGamingComponent } from './catalogo-gaming.component';

describe('CatalogoGamingComponent', () => {
  let component: CatalogoGamingComponent;
  let fixture: ComponentFixture<CatalogoGamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoGamingComponent, HttpClientTestingModule]
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
