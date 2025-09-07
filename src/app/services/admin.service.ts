// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl: string = 'https://todotechbackend.onrender.com';
  private credentials = {
    username: 'admin',
    password: '0000'
  };

  constructor(private http: HttpClient) {}

  // Crear headers con autenticación básica
  private createAuthHeaders(): HttpHeaders {
    const authToken = btoa(`${this.credentials.username}:${this.credentials.password}`);
    return new HttpHeaders({
      'Authorization': `Basic ${authToken}`,
      'Content-Type': 'application/json'
    });
  }

  // Método genérico para peticiones GET
  get<T>(endpoint: string): Observable<T> {
    const headers = this.createAuthHeaders();
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers });
  }

  // Método genérico para peticiones POST
  post<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.createAuthHeaders();
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers });
  }

  // Método genérico para peticiones PUT
  put<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.createAuthHeaders();
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, { headers });
  }

  // Método genérico para peticiones PATCH
  patch<T>(endpoint: string, data: any = {}): Observable<T> {
    const headers = this.createAuthHeaders();
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data, { headers });
  }

  // Método genérico para peticiones DELETE
  delete<T>(endpoint: string): Observable<T> {
    const headers = this.createAuthHeaders();
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers });
  }

  // Verificar conexión con el servidor
  checkConnection(): Observable<boolean> {
    return this.get('/usuarios').pipe(
      map(() => true),
      catchError(() => [false])
    );
  }
}