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

    this.authService.authenticate(this.username, this.password).subscribe({
      next: (session) => {
        this.loading.set(false);
        this.authService.login(this.username, session.token, session);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Error de conexión con el servidor';
        this.errorMsg.set(msg);
      }
    });
  }
}
