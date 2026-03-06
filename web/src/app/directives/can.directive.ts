// This is the directive that allows us to render elements based on the user's permissions.
// we have here three dependencies injected:

// - TemplateRef<any>: A reference to the template of the element that we want to conditionally render.
// For example, if we have <button *appCan="'delete:element'">Delete</button>, the TemplateRef
// will point to that button's template.

// - ViewContainerRef: This is used to manipulate the view, in this case to create or destroy the embedded
// view based on the permission check. This is actually what adds or removes the element from the DOM.

// - AuthService: This is our authentication service that contains the logic to check if the user has
// a specific permission. We will call the hasPermission method for that.

// The directive works in this way: so when it initializes, it checks if the user has the required
// permission. If they do, it creates an embedded view of the template (the element) and renders it.
// If they don't have the permission, it simply does nothing, so the element is not rendered at all.

// An embedded view is just a way to render a template in Angular, so it takes the TemplateRef,
// creates a view from it, and inserts it into the DOM at the place where the directive is used.
// Simple.

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
  }
}
