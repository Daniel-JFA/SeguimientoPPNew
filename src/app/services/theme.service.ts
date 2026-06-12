import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isLight = signal<boolean>(false);

  constructor() {
    // Solo acceder a localStorage en el lado del cliente (evitar errores SSR si aplica)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        this.isLight.set(true);
        document.body.classList.add('light-theme');
      }
    }

    // Efecto para reaccionar a los cambios de la señal
    effect(() => {
      const isLightMode = this.isLight();
      if (typeof window !== 'undefined') {
        if (isLightMode) {
          document.body.classList.add('light-theme');
          localStorage.setItem('theme', 'light');
        } else {
          document.body.classList.remove('light-theme');
          localStorage.setItem('theme', 'dark');
        }
      }
    });
  }

  public toggleTheme(): void {
    this.isLight.update(val => !val);
  }
}
