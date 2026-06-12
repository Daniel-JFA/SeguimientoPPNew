import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService, Evento } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { formatLocalYYYYMMDD } from '../../utils/date-utils';


@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss'
})
export class AgendaComponent implements OnInit {
  public events = signal<Evento[]>([]);
  public selectedDate = signal<Date>(new Date());
  public searchQuery = signal('');
  public selectedFilter = signal<'all' | 'pending' | 'rejected'>('all');
  
  // Calendario días
  public calendarWeeks = signal<Date[][]>([]);
  public monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  public filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedFilter();
    let list = this.events();

    if (query) {
      list = list.filter(e => 
        e.tituloevent.toLowerCase().includes(query) || 
        e.lugarevent.toLowerCase().includes(query) ||
        (e.identificacion && e.identificacion.toLowerCase().includes(query))
      );
    }

    if (filter === 'pending') {
      list = list.filter(e => e.color === '#fdcae1');
    } else if (filter === 'rejected') {
      list = list.filter(e => e.color === '#D97866');
    }

    return list;
  });

  constructor(
    private eventService: EventService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.generateCalendar();
  }

  public loadEvents(): void {
    // Tomar el primer día del mes actual para la API
    const firstDay = new Date(this.selectedDate().getFullYear(), this.selectedDate().getMonth(), 1);
    const dateStr = formatLocalYYYYMMDD(firstDay);
    
    this.eventService.getEvents(dateStr).subscribe(data => {
      this.events.set(data);
    });
  }

  public nextMonth(): void {
    const next = new Date(this.selectedDate().getFullYear(), this.selectedDate().getMonth() + 1, 1);
    this.selectedDate.set(next);
    this.generateCalendar();
    this.loadEvents();
  }

  public prevMonth(): void {
    const prev = new Date(this.selectedDate().getFullYear(), this.selectedDate().getMonth() - 1, 1);
    this.selectedDate.set(prev);
    this.generateCalendar();
    this.loadEvents();
  }

  public selectDay(date: Date): void {
    // Opcional: filtrar lista lateral por fecha seleccionada
  }

  public getEventsForDate(date: Date): Evento[] {
    const dateStr = formatLocalYYYYMMDD(date);
    return this.filteredEvents().filter(e => e.fechaevent === dateStr);
  }

  public generateCalendar(): void {
    const year = this.selectedDate().getFullYear();
    const month = this.selectedDate().getMonth();
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    // Obtener primer día de la semana (0: Domingo, 1: Lunes, etc.)
    // Ajustado a Lunes = 0
    let startDayOfWeek = startOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Domingo es el final

    const daysInMonth = endOfMonth.getDate();
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Rellenar días del mes anterior
    const prevMonthEnd = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      currentWeek.push(new Date(year, month - 1, prevMonthEnd - i));
    }
    
    // Rellenar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(year, month, day));
    }
    
    // Rellenar días del mes siguiente
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextMonthDay++));
    }
    weeks.push(currentWeek);
    
    this.calendarWeeks.set(weeks);
  }

  public isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  public isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.selectedDate().getMonth();
  }

  public onEventClick(event: Evento): void {
    const level = this.authService.currentUser()?.level;
    if (level === 1) {
      // Auditor -> Ir a auditoría
      this.router.navigate(['/auditoria'], { queryParams: { id: event.id_evento } });
    } else {
      // Dinamizador -> Ir a reportar/ver evento
      this.router.navigate(['/reportar-evento', event.id_evento]);
    }
  }
}
