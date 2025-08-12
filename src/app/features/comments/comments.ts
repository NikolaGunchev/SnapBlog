import { Component, inject, Input } from '@angular/core';
import { AuthenticationService } from '../../core/services';
import { Comment } from '../../model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';

@Component({
  selector: 'app-comments',
  imports: [TimeAgoPipe],
  templateUrl: './comments.html',
  styleUrl: './comments.css'
})
export class Comments {
  public authService=inject(AuthenticationService)

  @Input() comments!: Comment[]

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }
}
