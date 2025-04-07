import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  role: 'customer' | 'vendor' | 'admin';
  token: string;
}

interface DecodedToken {
  sub: string;
  name: string;
  role: 'customer' | 'vendor' | 'admin';
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decodedToken = this.decodeToken(storedToken);
      if (decodedToken && this.isTokenValid(decodedToken)) {
        this.userSubject.next({
          id: decodedToken.sub,
          name: decodedToken.name,
          role: decodedToken.role,
          token: storedToken
        });
      }
    }
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  private isTokenValid(decodedToken: DecodedToken): boolean {
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => console.log('Login response:', response)),
        map(response => {
          const token = response.accessToken;
          if (token) {
            localStorage.setItem('authToken', token);
            const decodedToken = this.decodeToken(token);
            if (decodedToken && this.isTokenValid(decodedToken)) {
              const user: User = {
                id: decodedToken.sub,
                name: decodedToken.name,
                role: decodedToken.role,
                token
              };
              this.userSubject.next(user);
              return user;
            } else {
              throw new Error('Invalid or expired token');
            }
          }
          throw new Error('No accessToken received in response');
        })
      );
  }

  register(data: { firstName: string; lastName: string; email: string; password: string; role: string }): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => console.log('Register response:', response)),
        map(response => {
          const token = response.accessToken;
          if (token) {
            localStorage.setItem('authToken', token);
            const decodedToken = this.decodeToken(token);
            if (decodedToken && this.isTokenValid(decodedToken)) {
              const user: User = {
                id: decodedToken.sub,
                name: decodedToken.name,
                role: decodedToken.role,
                token
              };
              this.userSubject.next(user);
              return user;
            } else {
              throw new Error('Invalid or expired token');
            }
          }
          throw new Error('No accessToken received in response');
        })
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): User | null {
    return this.userSubject.value;
  }
}