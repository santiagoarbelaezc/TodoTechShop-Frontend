import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CajaComponent } from './caja.component';

describe('CajaComponent', () => {
  let component: CajaComponent;
  let fixture: ComponentFixture<CajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

