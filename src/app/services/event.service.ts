import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Evento {
  id_evento: number;
  tituloevent: string;
  fechaevent: string;
  hora_inicioevent: string;
  hora_fin_reunion_asistencia?: string;
  lugarevent: string;
  id_comuna: number;
  barrio_evento?: string;
  direccion_evento?: string;
  departamento_organizador?: string;
  identificacion: string;
  tipo_reunion_asistencia?: string;
  color?: string;
  colorauditoria?: string;
  tiponoConforme?: string;
  observaciones?: string;
}

export interface Sesion {
  id_sesion: number;
  id_evento: number;
  fecha_revcalidad?: string;
  hora_revcalidad?: string;
  anexosscore?: string;
  observacioncalidad?: string;
  observacionauditcalidad?: string;
  horafineventdinam?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // NOTA PARA EL DESARROLLADOR: Ajustar con el host real de la API
  private apiUrl = 'https://dinamizadores.seguimientopp.co/api/v1';

  constructor(private http: HttpClient) {}

  // Obtener eventos para el calendario general
  public getEvents(startDate: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/events?startDate=${startDate}`).pipe(
      catchError(() => {
        // Fallback de desarrollo para que el calendario pinte sin fallas
        return of([
          {
            id_evento: 10694,
            tituloevent: 'Promoción y movilización de proyectos a priorizar con Consejo Distrital de Discapacidad',
            fechaevent: new Date().toISOString().substring(0, 10),
            hora_inicioevent: '14:00',
            lugarevent: 'Auditorio CAD',
            id_comuna: 10,
            identificacion: 'Camila Henao',
            color: '#fdcae1' // Color de calidad: En revisión
          },
          {
            id_evento: 10698,
            tituloevent: 'Promoción y movilización de proyectos a priorizar a familias cuidadoras',
            fechaevent: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
            hora_inicioevent: '08:00',
            lugarevent: 'Centro integrado San Cristóbal',
            id_comuna: 60,
            identificacion: 'Luis Felipe Oviedo',
            color: '#D97866', // Color de calidad: Producto no conforme
            tiponoConforme: 'Sin ajuste de calidad'
          }
        ]);
      })
    );
  }

  // Obtener detalle específico de un evento con su sesión
  public getEventDetails(eventId: number): Observable<{ evento: Evento; sesion?: Sesion }> {
    return this.http.get<{ evento: Evento; sesion?: Sesion }>(`${this.apiUrl}/events/${eventId}`).pipe(
      catchError(() => {
        return of({
          evento: {
            id_evento: eventId,
            tituloevent: 'Taller de pedagogía para presupuesto participativo',
            fechaevent: '2026-06-12',
            hora_inicioevent: '10:00',
            hora_fin_reunion_asistencia: '12:00',
            lugarevent: 'Aula Magna Bloque 3',
            id_comuna: 16,
            barrio_evento: 'Belén',
            direccion_evento: 'Calle 30 # 70-12',
            departamento_organizador: 'Secretaría de Participación Ciudadana',
            identificacion: 'Valeria Jaramillo',
            tipo_reunion_asistencia: 'Capacitación',
            color: '#fdcae1'
          },
          sesion: {
            id_sesion: 450,
            id_evento: eventId,
            horafineventdinam: '12:00'
          }
        });
      })
    );
  }

  // Crear o actualizar un evento
  public saveEvent(event: Partial<Evento>): Observable<Evento> {
    if (event.id_evento) {
      return this.http.put<Evento>(`${this.apiUrl}/events/${event.id_evento}`, event);
    }
    return this.http.post<Evento>(`${this.apiUrl}/events`, event);
  }

  // Subir un documento adjunto o corrección de evidencia
  public uploadEvidence(sesionId: number, fileType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    return this.http.post(`${this.apiUrl}/sesiones/${sesionId}/evidence`, formData);
  }

  // Guardar observaciones de auditoría de calidad
  public setQualityFeedback(sesionId: number, payload: { observacion: string; color: string; noConformeText: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/sesiones/${sesionId}/quality`, payload);
  }
}
