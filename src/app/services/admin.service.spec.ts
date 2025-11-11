import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

import { AdminService } from './admin.service';
import { AuthService } from './auth.service';

// Mocks
class MockAuthService {
  getToken = jasmine.createSpy('getToken').and.returnValue('fake-token');
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(true);
  logout = jasmine.createSpy('logout');
  getCurrentUser = jasmine.createSpy('getCurrentUser').and.returnValue({ 
    role: 'admin', 
    name: 'Test User' 
  });
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AdminService,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Métodos HTTP', () => {
    it('debería realizar GET exitoso', () => {
      const mockData = { id: 1, name: 'Test' };
      
      service.get<{id: number, name: string}>('/test').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush(mockData);
    });

    it('debería realizar POST exitoso', () => {
      const mockData = { name: 'Test' };
      const response = { id: 1, ...mockData };
      
      service.post('/test', mockData).subscribe(data => {
        expect(data).toEqual(response);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(response);
    });

    it('debería realizar PUT exitoso', () => {
      const mockData = { id: 1, name: 'Updated' };
      
      service.put('/test/1', mockData).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockData);
    });

    it('debería realizar PATCH exitoso', () => {
      const mockData = { name: 'Partially Updated' };
      
      service.patch('/test/1', mockData).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockData);
    });

    it('debería realizar DELETE exitoso', () => {
      service.delete('/test/1').subscribe(data => {
        expect(data).toEqual({ success: true });
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar error 401 y hacer logout', () => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      
      expect(authService.logout).toHaveBeenCalled();
    });

    it('debería manejar error 403 y hacer logout', () => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/test`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
      
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('Manejo de autenticación', () => {
    it('debería redirigir al login si no hay token', () => {
      authService.getToken.and.returnValue(null);
      authService.isLoggedIn.and.returnValue(false);

      // El método get() retorna un Observable que emite error, no lanza excepción directamente
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.message).toBe('Token no disponible o usuario no autenticado');
        }
      });
      
      expect(authService.logout).toHaveBeenCalled();
    });

    it('debería redirigir al login si usuario no está logueado', () => {
      authService.getToken.and.returnValue('fake-token');
      authService.isLoggedIn.and.returnValue(false);

      service.get('/test').subscribe({
        error: (error) => {
          expect(error.message).toBe('Token no disponible o usuario no autenticado');
        }
      });
      
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('checkPermission', () => {
    it('debería retornar true para rol correcto', () => {
      const result = service.checkPermission('admin');
      expect(result).toBeTrue();
    });

    it('debería retornar false y redirigir para rol incorrecto', () => {
      authService.getCurrentUser.and.returnValue({ role: 'user' });
      
      const result = service.checkPermission('admin');
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/acceso-denegado']);
    });

    it('debería redirigir al login si usuario no está autenticado', () => {
      authService.isLoggedIn.and.returnValue(false);
      
      const result = service.checkPermission('admin');
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('checkConnection', () => {
    it('debería retornar true en conexión exitosa', () => {
      service.checkConnection().subscribe(result => {
        expect(result).toBeTrue();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/usuarios`);
      req.flush([]);
    });

    it('debería retornar false en error de conexión', () => {
      service.checkConnection().subscribe(result => {
        expect(result).toBeFalse();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/usuarios`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('debería manejar error 401 en checkConnection', () => {
      service.checkConnection().subscribe(result => {
        expect(result).toBeFalse();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/usuarios`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});