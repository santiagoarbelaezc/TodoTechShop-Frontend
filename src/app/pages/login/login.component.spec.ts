import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

// Mocks completos
class MockAuthService {
  logout = jasmine.createSpy('logout');
  login = jasmine.createSpy('login').and.returnValue(of(true));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  events = of(); // Mock para el router events subscription
}

class MockActivatedRoute {
  queryParams = of({}); // Mock para queryParams
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    
    // No llamar fixture.detectChanges() inicialmente para evitar ngOnInit problemático
  });

  it('should create', () => {
    // Llamar detectChanges solo después de configurar los mocks
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize without errors', () => {
    // Configurar el mock de login antes de detectChanges
    authService.login.and.returnValue(of(true));
    
    fixture.detectChanges();
    
    expect(component).toBeDefined();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should have required properties', () => {
    fixture.detectChanges();
    
    expect(component.nombreUsuario).toBe('');
    expect(component.contrasena).toBe('');
    expect(component.isLoading).toBeFalse();
    expect(component.terminosAceptados).toBeFalse();
  });

  it('should validate form correctly', () => {
    fixture.detectChanges();
    
    // Form should be invalid initially
    expect(component.isFormValid()).toBeFalse();
    
    // Set valid data
    component.nombreUsuario = 'testuser';
    component.contrasena = 'Test123!';
    component.terminosAceptados = true;
    
    expect(component.validateUsername()).toBeTrue();
    expect(component.validatePassword()).toBeTrue();
  });
});