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
export class Header implements AfterViewInit {

  private authService = inject(AuthenticationService);
  private userService=inject(UserService)
  private router = inject(Router);
  
  readonly isLogged = this.authService.isLoggedIn;
  readonly currentUser = this.userService.userProfile
  

  
    ngAfterViewInit(): void {
    console.log(this.currentUser()?.username);
  }

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
