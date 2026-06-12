import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface UserSession {
  token: string;
  usuario: string;
  id_usuario: string;
  correo: string;
  rol: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Estado reactivo utilizando Signals de Angular
  private currentUserSignal = signal<UserSession | null>(null);

  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(private router: Router) {
    this.loadSession();
  }

  private loadSession(): void {
    const sessionStr = localStorage.getItem('pdl_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        this.currentUserSignal.set(session);
      } catch (e) {
        this.logout();
      }
    }
  }

  public login(user: string, token: string, details: Omit<UserSession, 'token'>): void {
    const session: UserSession = {
      token,
      usuario: details.usuario,
      id_usuario: details.id_usuario,
      correo: details.correo,
      rol: details.rol,
      level: details.level
    };
    localStorage.setItem('pdl_session', JSON.stringify(session));
    this.currentUserSignal.set(session);
    
    if (session.level === 1) {
      this.router.navigate(['/auditoria']);
    } else {
      this.router.navigate(['/agenda']);
    }
  }

  public logout(): void {
    localStorage.removeItem('pdl_session');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  public hasRole(requiredLevel: number): boolean {
    const user = this.currentUserSignal();
    return user ? user.level === requiredLevel : false;
  }
}
