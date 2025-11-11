import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CanActivateFn, Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

// Mock básico que cubre los casos comunes
class MockAuthService {
  isLoggedIn = jasmine.createSpy('isLoggedIn');
  getToken = jasmine.createSpy('getToken');
  logout = jasmine.createSpy('logout');
  getCurrentUser = jasmine.createSpy('getCurrentUser');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  createUrlTree = jasmine.createSpy('createUrlTree');
}

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // ¡IMPORTANTE!
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // Prueba básica de que el guardia se instancia correctamente
  it('should instantiate guard', () => {
    const guard = executeGuard;
    expect(guard).toBeDefined();
  });
});