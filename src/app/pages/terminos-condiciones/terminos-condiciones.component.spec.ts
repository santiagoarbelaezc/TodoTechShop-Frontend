import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TerminosCondicionesComponent } from './terminos-condiciones.component';

describe('TerminosCondicionesComponent', () => {
  let component: TerminosCondicionesComponent;
  let fixture: ComponentFixture<TerminosCondicionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminosCondicionesComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminosCondicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

