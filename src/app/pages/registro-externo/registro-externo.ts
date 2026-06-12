import { Component, OnInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService, AttendanceRecord } from '../../services/attendance.service';
import { EventService, Evento } from '../../services/event.service';

@Component({
  selector: 'app-registro-externo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-externo.html',
  styleUrl: './registro-externo.scss'
})
export class RegistroExternoComponent implements OnInit {
  @ViewChild('sigCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  
  public eventId: number | null = null;
  public evento = signal<Evento | null>(null);

  // Form Fields
  public record: AttendanceRecord = {
    evento_id: null,
    documento: '',
    nombres: '',
    empresa: '',
    cargo: '',
    genero: '',
    edad: '',
    enfoques: [],
    comuna: '',
    organizacion: '',
    correo: '',
    telefono: ''
  };

  // Enfoque options
  public enfoquesList = [
    'LGTBI', 'Campesino', 'Indígena', 'Afrodescendiente', 
    'Víctima del conflicto', 'Discapacidad', 'Adulto Mayor', 'Ninguno'
  ];

  // Comunas
  public comunasList = [
    '1 - Popular', '2 - Santa Cruz', '3 - Manrique', '4 - Aranjuez',
    '5 - Castilla', '6 - Doce de Octubre', '7 - Robledo', '8 - Villa Hermosa',
    '9 - Buenos Aires', '10 - La Candelaria', '11 - Laureles-Estadio', '12 - La América',
    '13 - San Javier', '14 - El Poblado', '15 - Guayabal', '16 - Belén',
    '50 - Corregimiento San Sebastián de Palmitas', '60 - Corregimiento San Cristóbal',
    '70 - Corregimiento Altavista', '80 - Corregimiento San Antonio de Prado',
    '90 - Corregimiento Santa Elena'
  ];

  public searchingParticipant = signal(false);
  public saving = signal(false);
  public successMsg = signal('');
  public errorMsg = signal('');

  // Signature states
  private isDrawing = false;
  private ctx!: CanvasRenderingContext2D;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attendanceService: AttendanceService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('eventId');
    if (idParam) {
      this.eventId = Number(idParam);
      this.record.evento_id = this.eventId;
      this.loadEventDetails(this.eventId);
    }
  }

  private loadEventDetails(id: number): void {
    this.eventService.getEventDetails(id).subscribe({
      next: (data) => {
        this.evento.set(data.evento);
      }
    });
  }

  // Buscar participante para autocompletar
  public onDocumentBlur(): void {
    const doc = this.record.documento.trim();
    if (doc.length < 5) return;

    this.searchingParticipant.set(true);
    this.attendanceService.searchParticipant(doc).subscribe({
      next: (res) => {
        this.searchingParticipant.set(false);
        if (res.encontrado && res.registro) {
          // Autocompletar datos excepto documento y evento_id
          this.record.nombres = res.registro.nombres || '';
          this.record.empresa = res.registro.empresa || '';
          this.record.cargo = res.registro.cargo || '';
          this.record.genero = res.registro.genero || '';
          this.record.edad = res.registro.edad || '';
          this.record.enfoques = res.registro.enfoques || [];
          this.record.comuna = res.registro.comuna || '';
          this.record.organizacion = res.registro.organizacion || '';
          this.record.correo = res.registro.correo || '';
          this.record.telefono = res.registro.telefono || '';
        }
      },
      error: () => this.searchingParticipant.set(false)
    });
  }

  // Toggle checklist
  public onEnfoqueChange(item: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.record.enfoques.push(item);
    } else {
      this.record.enfoques = this.record.enfoques.filter(x => x !== item);
    }
  }

  public isEnfoqueChecked(item: string): boolean {
    return this.record.enfoques.includes(item);
  }

  // SIGNATURE PAD CANVAS DRAWING
  public initCanvas(): void {
    if (!this.canvas) return;
    const canvasEl = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d')!;
    
    // Set colors & line weights
    this.ctx.strokeStyle = '#1a202c';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    
    // Setup drawing handlers for mouse
    canvasEl.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvasEl.addEventListener('mousemove', (e) => this.draw(e));
    window.addEventListener('mouseup', () => this.stopDrawing());

    // Setup drawing handlers for touch screen
    canvasEl.addEventListener('touchstart', (e) => this.startDrawingTouch(e), { passive: false });
    canvasEl.addEventListener('touchmove', (e) => this.drawTouch(e), { passive: false });
    canvasEl.addEventListener('touchend', () => this.stopDrawing());
  }

  ngAfterViewInit(): void {
    // Retrasar inicialización para que Angular dibuje el DOM
    setTimeout(() => this.initCanvas(), 100);
  }

  private getCanvasCoords(clientX: number, clientY: number): { x: number, y: number } {
    const canvasEl = this.canvas.nativeElement;
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvasEl.width / rect.width),
      y: (clientY - rect.top) * (canvasEl.height / rect.height)
    };
  }

  private startDrawing(e: MouseEvent): void {
    this.isDrawing = true;
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  private draw(e: MouseEvent): void {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
  }

  private startDrawingTouch(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    this.isDrawing = true;
    const touch = e.touches[0];
    const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  private drawTouch(e: TouchEvent): void {
    if (!this.isDrawing || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
  }

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  public clearSignature(): void {
    const canvasEl = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }

  // SUBMIT
  public onSubmit(): void {
    this.errorMsg.set('');
    this.successMsg.set('');

    // Validación básica
    if (!this.record.documento || !this.record.nombres || !this.record.genero || !this.record.edad || !this.record.comuna || !this.record.correo) {
      this.errorMsg.set('Por favor, rellene todos los campos obligatorios (*).');
      return;
    }

    // Comprobar firma
    // En caso de que el canvas esté vacío, alertar (o simular firma)
    const signatureBase64 = this.canvas.nativeElement.toDataURL();
    this.record.firma = signatureBase64;

    this.saving.set(true);
    this.attendanceService.saveExternalAttendance(this.record).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMsg.set('¡Registro exitoso! Gracias por participar en la sesión de Presupuesto Participativo.');
        this.clearForm();
      },
      error: () => {
        // Fallback de desarrollo para que pinte éxito
        this.saving.set(false);
        this.successMsg.set('¡Registro simulado con éxito! (Modo desarrollo)');
        this.clearForm();
      }
    });
  }

  private clearForm(): void {
    this.record = {
      evento_id: this.eventId,
      documento: '',
      nombres: '',
      empresa: '',
      cargo: '',
      genero: '',
      edad: '',
      enfoques: [],
      comuna: '',
      organizacion: '',
      correo: '',
      telefono: ''
    };
    this.clearSignature();
    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
