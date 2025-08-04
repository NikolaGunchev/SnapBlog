import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../core/services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private authService=inject(AuthenticationService)

  readonly isLogged=this.authService.isLogged
  readonly currentUser=this.authService.currentUser

  logout(){
    this.authService.logout()
    // router to navigate
  }
}
