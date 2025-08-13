import { Component, inject } from '@angular/core';
import { Footer } from '../../shared/footer/footer';
import { AuthenticationService, UserService } from '../../core/services';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  imports: [Footer, TimeAgoPipe, MenuIcons],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  private userService = inject(UserService);
  private navigateRoute=inject(Router)
  private authService=inject(AuthenticationService)

  currentUser = this.userService.userProfile;

  handleEditClicked(): void {
    this.navigateRoute.navigate([`user-edit/${this.currentUser()?.id}`])
  }

  async handleDeleteClicked(): Promise<void> {
    const confirmation = confirm('Are you absolutely sure you want to delete your account? This action will delete all your groups, posts, and comments.');

    if (confirmation) {
      try {
        const result = await this.userService.deleteUserAccount();

        if (result.success) {
          await firstValueFrom(this.authService.logout());
          this.navigateRoute.navigate(['/']);
          alert('Your account has been successfully deleted.');
        } else {
          console.error('Failed to delete account:', result.error);
        }
      } catch (error: any) {
        console.error('An unexpected error occurred during account deletion:', error);
      }
    }
  }
}
