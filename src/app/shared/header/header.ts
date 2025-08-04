import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../core/services';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  readonly isLogged = this.authService.isLogged;
  readonly currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['']);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
