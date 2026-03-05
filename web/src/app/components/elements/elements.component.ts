import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CanDirective } from '../../directives/can.directive';
import { AuthService } from '../../services/auth.service';

interface Element {
  id: string;
  name: string;
  description: string;
  status: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, CanDirective],
  templateUrl: 'elements.component.html',
  styleUrls: ['elements.component.css'],
})
export class ElementsComponent implements OnInit {
  protected auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  elements = signal<Element[]>([]);
  selected = signal<Element | null>(null);
  loading = signal(true);
  feedback = signal('');

  perms = computed(() => [...this.auth['_permissions']()]);
  permCount = computed(() => this.auth['_permissions']().size);

  private readonly API = 'http://localhost:3000';

  ngOnInit() {
    this.loadElements();
  }

  loadElements() {
    this.loading.set(true);
    this.http.get<Element[]>(`${this.API}/elements`).subscribe({
      next: (els) => {
        this.elements.set(els);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  select(el: Element) {
    this.selected.set(el);
  }

  create() {
    this.http
      .post<Element>(`${this.API}/elements`, {
        name: `Elemento ${Date.now()}`,
        description: 'Creado desde Angular',
      })
      .subscribe({
        next: (el) => {
          this.elements.update((els) => [...els, el]);
          this.showFeedback('Elemento creado ✓');
        },
      });
  }

  update() {
    const selected = this.selected();
    if (!selected) {
      this.showFeedback('Seleccioná un elemento primero');
      return;
    }
    this.http
      .patch<Element>(`${this.API}/elements/${selected.id}`, {
        name: `${selected.name} (editado)`,
      })
      .subscribe({
        next: (updated) => {
          this.elements.update((els) => els.map((e) => (e.id === updated.id ? updated : e)));
          this.showFeedback('Elemento actualizado ✓');
        },
      });
  }

  delete() {
    const selected = this.selected();
    if (!selected) {
      this.showFeedback('Seleccioná un elemento primero');
      return;
    }
    this.http.delete(`${this.API}/elements/${selected.id}`).subscribe({
      next: () => {
        this.elements.update((els) => els.filter((e) => e.id !== selected.id));
        this.selected.set(null);
        this.showFeedback('Elemento eliminado ✓');
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private showFeedback(msg: string) {
    this.feedback.set(msg);
    setTimeout(() => this.feedback.set(''), 2500);
  }
}
