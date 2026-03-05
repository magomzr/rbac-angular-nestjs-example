import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({ selector: '[appCan]', standalone: true })
export class CanDirective implements OnInit {
  @Input('appCan') permission!: string;
  private readonly tpl = inject(TemplateRef<any>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    if (this.auth.hasPermission(this.permission)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
    // sin permiso → el elemento no existe en el DOM
  }
}

/* USO EN TEMPLATE:
 *
 * <button *appCan="'delete:element'">
 *   Eliminar
 * </button>
 *
 * Si no tiene el permiso, el <button>
 * directamente no se renderiza.
 */
