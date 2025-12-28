import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoPresentacionComponent } from './catalogo-presentacion.component';

describe('CatalogoPresentacionComponent', () => {
  let component: CatalogoPresentacionComponent;
  let fixture: ComponentFixture<CatalogoPresentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoPresentacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoPresentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
