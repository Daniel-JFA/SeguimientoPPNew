import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService, Evento, Sesion } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reportar-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reportar-evento.html',
  styleUrl: './reportar-evento.scss'
})
export class ReportarEventoComponent implements OnInit {
  public eventId: number | null = null;
  public evento = signal<Evento | null>(null);
  public sesion = signal<Sesion | null>(null);

  // Form Fields
  public horafineventdinam = '';
  public observaciones = '';
  public tipo_reunion_asistencia = '';
  
  // Moments
  public momentos = {
    momento1: false,
    momento2: false,
    momento3: false
  };

  // Upload States
  public uploadStatuses = signal<{ [key: string]: { loading: boolean; success: boolean; error: string } }>({
    'FO-GINF-093': { loading: false, success: false, error: '' },
    'Fotos': { loading: false, success: false, error: '' },
    'Acta': { loading: false, success: false, error: '' }
  });

  public saving = signal(false);
  public saveSuccess = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.eventId = Number(idParam);
      this.loadEventDetails(this.eventId);
    }
  }

  private loadEventDetails(id: number): void {
    this.eventService.getEventDetails(id).subscribe({
      next: (data) => {
        this.evento.set(data.evento);
        if (data.sesion) {
          this.sesion.set(data.sesion);
          this.horafineventdinam = data.sesion.horafineventdinam || '';
          this.observaciones = data.evento.observaciones || '';
          this.tipo_reunion_asistencia = data.evento.tipo_reunion_asistencia || '';
          
          // Parse score/anexos if they exist to mark as uploaded
          const scoring = data.sesion.anexoscore || '';
          const statuses = { ...this.uploadStatuses() };
          if (scoring.includes('FO-GINF-093')) statuses['FO-GINF-093'].success = true;
          if (scoring.includes('Fotos')) statuses['Fotos'].success = true;
          if (scoring.includes('Acta')) statuses['Acta'].success = true;
          this.uploadStatuses.set(statuses);
        }
      },
      error: () => {
        // Redirigir si falla la carga en producción
        this.router.navigate(['/agenda']);
      }
    });
  }

  public onFileChange(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const sesionId = this.sesion()?.id_sesion;
      
      if (!sesionId) return;

      const statuses = { ...this.uploadStatuses() };
      statuses[type] = { loading: true, success: false, error: '' };
      this.uploadStatuses.set(statuses);

      this.eventService.uploadEvidence(sesionId, type, file).subscribe({
        next: () => {
          const s = { ...this.uploadStatuses() };
          s[type] = { loading: false, success: true, error: '' };
          this.uploadStatuses.set(s);
          
          // Actualizar estado del evento local si es corrección
          if (this.evento()?.color === '#D97866') {
            const currentEv = this.evento();
            if (currentEv) {
              this.evento.set({ ...currentEv, color: '#fdcae1' }); // Volver a revisión
            }
          }
        },
        error: (err) => {
          const s = { ...this.uploadStatuses() };
          s[type] = { loading: false, success: false, error: 'Error al subir archivo' };
          this.uploadStatuses.set(s);
        }
      });
    }
  }

  public onSubmit(): void {
    if (!this.evento()) return;

    this.saving.set(true);
    this.saveSuccess.set(false);

    // Preparar guardado
    const updatedEvent: Partial<Evento> = {
      id_evento: this.eventId!,
      tipo_reunion_asistencia: this.tipo_reunion_asistencia,
      observaciones: this.observaciones
    };

    this.eventService.saveEvent(updatedEvent).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
