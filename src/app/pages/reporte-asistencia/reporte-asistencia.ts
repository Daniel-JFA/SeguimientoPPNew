import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceService, AttendanceRecord } from '../../services/attendance.service';
import { EventService, Evento } from '../../services/event.service';

interface Demographics {
  gender: { [key: string]: number };
  age: { [key: string]: number };
  focus: { [key: string]: number };
}

@Component({
  selector: 'app-reporte-asistencia',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reporte-asistencia.html',
  styleUrl: './reporte-asistencia.scss'
})
export class ReporteAsistenciaComponent implements OnInit {
  public eventId: number | null = null;
  public evento = signal<Evento | null>(null);
  public attendees = signal<AttendanceRecord[]>([]);

  // Caracterización estadística reactiva
  public stats = computed<Demographics>(() => {
    const list = this.attendees();
    const gCounts: { [key: string]: number } = { 'Hombre': 0, 'Mujer': 0, 'Otro': 0 };
    const aCounts: { [key: string]: number } = { '14-28': 0, '29-54': 0, '55+': 0 };
    const fCounts: { [key: string]: number } = {
      'LGTBI': 0, 'Campesino': 0, 'Indígena': 0, 'Afrodescendiente': 0,
      'Víctima del conflicto': 0, 'Discapacidad': 0, 'Adulto Mayor': 0, 'Ninguno': 0
    };

    list.forEach(att => {
      // 1. Género
      const g = att.genero;
      if (g === 'Hombre') gCounts['Hombre']++;
      else if (g === 'Mujer') gCounts['Mujer']++;
      else gCounts['Otro']++;

      // 2. Edad
      const ageStr = String(att.edad);
      if (ageStr.includes('14') || ageStr.includes('28') || Number(ageStr) <= 28) {
        aCounts['14-28']++;
      } else if (ageStr.includes('55') || Number(ageStr) >= 55) {
        aCounts['55+']++;
      } else {
        aCounts['29-54']++;
      }

      // 3. Enfoques
      const enfoques = att.enfoques || [];
      enfoques.forEach(f => {
        if (fCounts[f] !== undefined) {
          fCounts[f]++;
        }
      });
      if (enfoques.length === 0) {
        fCounts['Ninguno']++;
      }
    });

    return { gender: gCounts, age: aCounts, focus: fCounts };
  });

  constructor(
    private route: ActivatedRoute,
    private attendanceService: AttendanceService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('eventId');
    if (idParam) {
      this.eventId = Number(idParam);
      this.loadEventData(this.eventId);
      this.loadAttendanceData(this.eventId);
    }
  }

  private loadEventData(id: number): void {
    this.eventService.getEventDetails(id).subscribe({
      next: (data) => {
        this.evento.set(data.evento);
      }
    });
  }

  private loadAttendanceData(id: number): void {
    this.attendanceService.getAttendanceList(id).subscribe({
      next: (data) => {
        this.attendees.set(data);
      }
    });
  }

  public printReport(): void {
    window.print();
  }
}
