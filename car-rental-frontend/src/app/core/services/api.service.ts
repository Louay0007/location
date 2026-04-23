// ═════════════════════════════════════════════════════════════════════════════════════════
// API SERVICE — HTTP Client with Interceptors
// ═════════════════════════════════════════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, ErrorResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1';

  // ─────────────────────────────────────────────────────────────────────────
  // HTTP Methods
  // ─────────────────────────────────────────────────────────────────────────

  get<T>(endpoint: string, params?: Record<string, any>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams, withCredentials: true });
  }

  getRaw<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    return this.get<T>(endpoint, params).pipe(
      map(response => response.data)
    );
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  postRaw<T>(endpoint: string, body: any): Observable<T> {
    return this.post<T>(endpoint, body).pipe(
      map(response => response.data)
    );
  }

  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  putRaw<T>(endpoint: string, body: any): Observable<T> {
    return this.put<T>(endpoint, body).pipe(
      map(response => response.data)
    );
  }

  patch<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  patchRaw<T>(endpoint: string, body: any): Observable<T> {
    return this.patch<T>(endpoint, body).pipe(
      map(response => response.data)
    );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  deleteRaw<T>(endpoint: string): Observable<T> {
    return this.delete<T>(endpoint).pipe(
      map(response => response.data)
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────────────────────────────────────

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      const serverError = error.error as ErrorResponse;
      if (serverError.message) {
        errorMessage = serverError.message;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de se connecter au serveur';
            break;
          case 400:
            errorMessage = 'Requête invalide';
            break;
          case 401:
            errorMessage = 'Non autorisé. Veuillez vous reconnecter';
            break;
          case 403:
            errorMessage = 'Accès refusé';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = 'Conflit de données';
            break;
          case 422:
            errorMessage = 'Données invalides';
            break;
          case 429:
            errorMessage = 'Trop de requêtes. Veuillez patienter';
            break;
          case 500:
            errorMessage = 'Erreur serveur interne';
            break;
          default:
            errorMessage = `Erreur ${error.status}`;
        }
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error.error
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────

  buildQueryParams(filters: Record<string, any>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params[key] = value.join(',');
        } else if (typeof value === 'boolean') {
          params[key] = value.toString();
        } else if (typeof value === 'object') {
          Object.assign(params, this.buildQueryParams(value));
        } else {
          params[key] = value.toString();
        }
      }
    });
    return params;
  }
}