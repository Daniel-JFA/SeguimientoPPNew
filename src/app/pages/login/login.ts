import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  public username = '';
  public password = '';
  public errorMsg = signal('');
  public loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  public onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMsg.set('Usuario y contraseña obligatorios');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    // NOTA PARA EL DESARROLLADOR: Cambiar por llamada real HTTP del AuthService.
    // Ejemplo de simulación de respuesta según rol de seguimientoPP
    setTimeout(() => {
      this.loading.set(false);
      
      const lowerUser = this.username.toLowerCase();
      if (lowerUser === 'admin' && this.password === 'admin') {
        // Logueo como Auditor de Calidad (Level 1)
        this.authService.login(this.username, 'mock-jwt-token-admin', {
          usuario: 'Laura Rivera Admin',
          id_usuario: '10982734',
          correo: 'laura.rivera@medellin.gov.co',
          rol: 'Auditor de Calidad',
          level: 1
        });
      } else if (lowerUser === 'mediador' && this.password === 'mediador') {
        // Logueo como Dinamizador / Mediador (Level 2)
        this.authService.login(this.username, 'mock-jwt-token-mediador', {
          usuario: 'Carlos Mario Dinamizador',
          id_usuario: '43900123',
          correo: 'carlos.mario@example.com',
          rol: 'Mediador Territorial',
          level: 2
        });
      } else {
        this.errorMsg.set('Usuario y/o contraseña incorrectos');
      }
    }, 1000);
  }
}
