// src/app/services/usuario.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { UsuarioDto } from '../models/usuario/usuario.dto';
import { LoginResponse } from '../models/login-response.dto';
import { environment } from '../../environments/environment';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  const mockUsuario: UsuarioDto = {
    id: 1,
    nombre: 'Test User',
    cedula: '1234567890',
    correo: 'test@test.com',
    telefono: '123456789',
    nombreUsuario: 'testuser',
    contrasena: 'password',
    cambiarContrasena: false,
    tipoUsuario: 'USER',
    fechaCreacion: new Date('2023-01-01'),
    estado: true
  };

  const mockLoginResponse: LoginResponse = {
    token: 'test-token',
    tokenType: 'Bearer',
    userId: 1,
    username: 'testuser',
    nombre: 'Test User',
    role: 'USER',
    mensaje: 'Login exitoso'
  };

  const mockMensaje = {
    error: false,
    data: 'Operación exitosa',
    mensaje: 'Success'
  };

  const mockMensajeUsuarios = {
    error: false,
    data: [mockUsuario],
    mensaje: 'Success'
  };

  const mockMensajeUsuario = {
    error: false,
    data: mockUsuario,
    mensaje: 'Success'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService]
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string): string => {
      return store[key] || '';
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): void => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake((): void => {
      store = {};
    });
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Configuración inicial', () => {
    it('debería crearse correctamente', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Métodos HTTP', () => {
    it('debería obtener usuarios exitosamente', () => {
      service.obtenerUsuarios().subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería manejar error en obtenerUsuarios', () => {
      service.obtenerUsuarios().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('debería crear usuario exitosamente', () => {
      service.crearUsuario(mockUsuario).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUsuario);
      req.flush(mockMensaje);
    });

    it('debería obtener último usuario exitosamente', () => {
      service.obtenerUltimoUsuario().subscribe(usuario => {
        expect(usuario).toEqual(mockUsuario);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/ultimo`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuario);
    });

    it('debería actualizar usuario como admin exitosamente', () => {
      service.actualizarUsuarioAdmin(1, mockUsuario).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUsuario);
      req.flush(mockMensaje);
    });

    it('debería cambiar estado de usuario exitosamente', () => {
      service.cambiarEstadoUsuario(1, true).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1/estado?estado=true`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockMensaje);
    });

    it('debería eliminar usuario exitosamente', () => {
      service.eliminarUsuario(1).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockMensaje);
    });

    it('debería obtener usuario por ID exitosamente', () => {
      service.obtenerUsuarioPorId(1).subscribe(usuario => {
        expect(usuario).toEqual(mockUsuario);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuario);
    });

    it('debería obtener usuarios activos exitosamente', () => {
      service.obtenerUsuariosActivos().subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/activos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería obtener usuarios inactivos exitosamente', () => {
      service.obtenerUsuariosInactivos().subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/inactivos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería buscar usuarios por nombre exitosamente', () => {
      const nombre = 'Test';
      service.buscarUsuariosPorNombre(nombre).subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/buscar/nombre?nombre=${encodeURIComponent(nombre)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería buscar usuarios por cédula exitosamente', () => {
      const cedula = '1234567890';
      service.buscarUsuariosPorCedula(cedula).subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/buscar/cedula?cedula=${encodeURIComponent(cedula)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería obtener usuarios por tipo exitosamente', () => {
      const tipo = 'USER';
      service.obtenerUsuariosPorTipo(tipo).subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/tipo/${tipo}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería obtener usuarios por fecha de creación exitosamente', () => {
      const fechaInicio = new Date('2023-01-01');
      const fechaFin = new Date('2023-12-31');
      
      service.obtenerUsuariosPorFechaCreacion(fechaInicio, fechaFin).subscribe(usuarios => {
        expect(usuarios).toEqual([mockUsuario]);
      });

      const expectedUrl = `${environment.apiUrl}/usuarios/fecha-creacion?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeUsuarios);
    });

    it('debería solicitar recordatorio de contraseña exitosamente', () => {
      const correo = 'test@example.com';
      
      service.solicitarRecordatorioContrasena(correo).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const expectedUrl = `${environment.apiUrl}/usuarios/recordar-contrasena?correo=${encodeURIComponent(correo)}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockMensaje);
    });
  });

  describe('Gestión de estado del usuario', () => {
    it('debería establecer usuario correctamente', () => {
      service.setUsuario(mockLoginResponse);

      service.getUsuarioObservable().subscribe(usuario => {
        expect(usuario).toEqual(mockLoginResponse);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('usuarioActual', JSON.stringify(mockLoginResponse));
    });

    it('debería obtener usuario desde localStorage si no está en subject', () => {
      localStorage.setItem('usuarioActual', JSON.stringify(mockLoginResponse));

      const usuario = service.getUsuario();
      expect(usuario).toEqual(mockLoginResponse);
    });

    it('debería limpiar usuario correctamente', () => {
      service.setUsuario(mockLoginResponse);
      service.limpiarUsuario();

      service.getUsuarioObservable().subscribe(usuario => {
        expect(usuario).toBeNull();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('usuarioActual');
    });

    it('debería verificar si usuario está logueado', () => {
      expect(service.isUsuarioLogueado()).toBeFalse();

      service.setUsuario(mockLoginResponse);
      expect(service.isUsuarioLogueado()).toBeTrue();
    });

    it('debería actualizar usuario si coincide el ID', () => {
      service.setUsuario(mockLoginResponse);
      
      const usuarioActualizado: LoginResponse = {
        ...mockLoginResponse,
        nombre: 'Usuario Actualizado'
      };

      service.actualizarUsuario(usuarioActualizado);

      const usuario = service.getUsuario();
      expect(usuario?.nombre).toBe('Usuario Actualizado');
    });

    it('debería manejar JSON inválido en localStorage', () => {
      localStorage.setItem('usuarioActual', 'invalid-json');

      const usuario = service.getUsuario();
      expect(usuario).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('usuarioActual');
    });
  });

  describe('Headers y autenticación', () => {
    it('debería incluir token en headers cuando existe', () => {
      localStorage.setItem('authToken', 'test-token');

      service.obtenerUsuarios().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockMensajeUsuarios);
    });

    it('debería incluir headers sin token cuando no existe', () => {
      localStorage.removeItem('authToken');

      service.obtenerUsuarios().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer ');
      req.flush(mockMensajeUsuarios);
    });
  });
});