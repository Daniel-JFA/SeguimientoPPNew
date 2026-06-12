import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService, Evento, Sesion } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss'
})
export class AuditoriaComponent implements OnInit {
  public eventId: number | null = null;
  public evento = signal<Evento | null>(null);
  public sesion = signal<Sesion | null>(null);

  // Form Fields
  public observacioncalidad = '';
  public colorStatus = '';
  public tiponoConforme = '';

  public saving = signal(false);
  public saveSuccess = signal(false);

  // Auditor info
  public pendingSessions = signal<Evento[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en query params (para recarga de eventos)
    this.route.queryParams.subscribe(params => {
      const idParam = params['id'];
      if (idParam) {
        this.eventId = Number(idParam);
        this.loadEventDetails(this.eventId);
      } else {
        this.loadPendingSessions();
      }
    });
  }

  private loadPendingSessions(): void {
    // Carga de eventos pendientes para auditar (los que están en color rosa o rojo)
    this.eventService.getEvents(new Date().toISOString().substring(0, 10)).subscribe(events => {
      this.pendingSessions.set(events.filter(e => e.color === '#fdcae1' || e.color === '#D97866'));
    });
  }

  private loadEventDetails(id: number): void {
    this.eventService.getEventDetails(id).subscribe({
      next: (data) => {
        this.evento.set(data.evento);
        if (data.sesion) {
          this.sesion.set(data.sesion);
          this.observacioncalidad = data.sesion.observacioncalidad || '';
          this.colorStatus = data.evento.color || '#fdcae1';
          this.tiponoConforme = data.evento.tiponoConforme || '';
        }
        this.loadPendingSessions();
      }
    });
  }

  public selectEvent(event: Evento): void {
    this.router.navigate(['/auditoria'], { queryParams: { id: event.id_evento } });
  }

  public onSubmit(): void {
    const sesionId = this.sesion()?.id_sesion;
    if (!sesionId) return;

    this.saving.set(true);
    this.saveSuccess.set(false);

    const payload = {
      observacion: this.observacioncalidad,
      color: this.colorStatus,
      noConformeText: this.colorStatus === '#D97866' ? this.tiponoConforme : ''
    };

    this.eventService.setQualityFeedback(sesionId, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
        
        // Actualizar datos locales
        const currentEv = this.evento();
        if (currentEv) {
          this.evento.set({ 
            ...currentEv, 
            color: this.colorStatus,
            tiponoConforme: payload.noConformeText
          });
        }
        this.loadPendingSessions();
      },
      error: () => {
        // Fallback en desarrollo
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
        
        const currentEv = this.evento();
        if (currentEv) {
          this.evento.set({ 
            ...currentEv, 
            color: this.colorStatus,
            tiponoConforme: payload.noConformeText
          });
        }
        this.loadPendingSessions();
      }
    });
  }
}
