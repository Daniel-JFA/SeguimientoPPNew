import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { AgendaComponent } from './pages/agenda/agenda';
import { ReportarEventoComponent } from './pages/reportar-evento/reportar-evento';
import { RegistroExternoComponent } from './pages/registro-externo/registro-externo';
import { ReporteAsistenciaComponent } from './pages/reporte-asistencia/reporte-asistencia';
import { AuditoriaComponent } from './pages/auditoria/auditoria';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'agenda', component: AgendaComponent, canActivate: [authGuard] },
  { path: 'reportar-evento/:id', component: ReportarEventoComponent, canActivate: [authGuard] },
  { path: 'registro-externo/:eventId', component: RegistroExternoComponent },
  { path: 'reporte-asistencia/:eventId', component: ReporteAsistenciaComponent, canActivate: [authGuard] },
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [authGuard], data: { requiredLevel: 1 } },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
