import { Component, inject } from '@angular/core';
import { Footer } from '../../shared/footer/footer';
import { UserService } from '../../core/services';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { User } from '../../model';

@Component({
  selector: 'app-user-profile',
  imports: [Footer, TimeAgoPipe, MenuIcons],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  private userService = inject(UserService);

  currentUser = this.userService.userProfile;

  handleEditClicked(user: User): void {
    console.log('Editing user:', user.username, 'Text:', user.bio);
  }

  deletePost(user: User): void {
    console.log('deleting user:', user.username, 'Text:', user.bio);
  }
}
