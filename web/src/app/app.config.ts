// This file is where we set up the main configuration of the Angular app. Here
// we use the withInterceptors function to add the authInterceptor to the HTTP
// client. With this interceptor, we can automatically attach the JWT token to
// every HTTP request made from the app.

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '../interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
};
