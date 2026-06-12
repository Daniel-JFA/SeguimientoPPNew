import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  onLogout(): void {
    this.authService.logout();
  }
}
