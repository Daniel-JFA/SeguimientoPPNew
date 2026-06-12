import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AttendanceRecord {
  id?: number;
  evento_id: number | null;
  documento: string;
  nombres: string;
  empresa?: string;
  cargo?: string;
  genero: string;
  edad: string;
  enfoques: string[];
  comuna: string;
  organizacion?: string;
  correo: string;
  telefono?: string;
  firma?: string; // Base64
  firma_archivo?: string;
  attended?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Buscar última asistencia del participante para autocompletar
  public searchParticipant(document: string): Observable<{ encontrado: boolean; registro: Partial<AttendanceRecord> | null }> {
    return this.http.get<{ encontrado: boolean; registro: Partial<AttendanceRecord> | null }>(
      `${this.apiUrl}/asistencias/buscar?documento=${document}`
    ).pipe(
      catchError(() => {
        // Mock en caso de no conectar a base de datos de desarrollo
        if (document === '123456') {
          return of({
            encontrado: true,
            registro: {
              nombres: 'María Camila Restrepo',
              empresa: 'Corporación Comuna Viva',
              cargo: 'Coordinadora Social',
              genero: 'Mujer',
              edad: '29-54',
              enfoques: ['LGTBI', 'Campesino'],
              comuna: '10 - La Candelaria',
              organizacion: 'Junta de Acción Comunal',
              correo: 'maria.restrepo@example.com',
              telefono: '3124567890'
            }
          });
        }
        return of({ encontrado: false, registro: null });
      })
    );
  }

  // Guardar una nueva asistencia externa (público)
  public saveExternalAttendance(record: AttendanceRecord): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.apiUrl}/asistencias/registro-externo`,
      record
    );
  }

  // Obtener listado de asistencia para un evento específico
  public getAttendanceList(eventId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/asistencias/evento/${eventId}`).pipe(
      catchError(() => {
        // Mock de datos de asistencia del evento
        return of([
          {
            evento_id: eventId,
            documento: '123456',
            nombres: 'María Camila Restrepo',
            empresa: 'Corporación Comuna Viva',
            cargo: 'Coordinadora Social',
            genero: 'Mujer',
            edad: '29', // Guardada como límite inferior en base de datos
            enfoques: ['LGTBI', 'Campesino'],
            comuna: '10 - La Candelaria',
            organizacion: 'Junta de Acción Comunal',
            correo: 'maria.restrepo@example.com',
            telefono: '3124567890',
            firma_archivo: 'firma_123456_20260612.png',
            attended: true
          },
          {
            evento_id: eventId,
            documento: '789012',
            nombres: 'Carlos Andrés Gómez',
            empresa: 'Independiente',
            cargo: 'Vecino',
            genero: 'Hombre',
            edad: '55',
            enfoques: ['Afrodescendiente'],
            comuna: '16 - Belén',
            correo: 'carlos.gomez@example.com',
            firma_archivo: 'firma_789012_20260612.png',
            attended: true
          }
        ]);
      })
    );
  }
}
