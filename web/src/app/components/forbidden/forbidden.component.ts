import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [],
  templateUrl: 'forbidden.component.html',
  styleUrls: ['forbidden.component.css'],
})
export class ForbiddenComponent {
  private readonly router = inject(Router);
  back() {
    this.router.navigate(['/elements']);
  }
}
