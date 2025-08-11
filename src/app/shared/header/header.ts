import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { AuthenticationService } from '../../core/services';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/userProfile.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private authService = inject(AuthenticationService);
  private userService=inject(UserService)
  private router = inject(Router);
  
  readonly isLogged = this.authService.isLoggedIn;
  readonly currentUser = this.userService.userProfile

  showMenu: boolean = false;
  private hideTimeout: any;

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

  openMenu(): void {
    // Clear any pending hide timeout if the user re-enters quickly
    this.cancelClose();
    this.showMenu = true;
  }

  closeMenu(): void {
    // Start a timeout to hide the menu after a short delay
    this.hideTimeout = setTimeout(() => {
      this.showMenu = false;
    }, 300);
  }

  cancelClose(): void {
    // Clear the hide timeout immediately if the mouse re-enters
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  ngOnDestroy(): void {
    // Clean up the timeout when the component is destroyed to prevent memory leaks
    this.cancelClose();
  }
}
