import { Component, inject, Input } from '@angular/core';
import { AuthenticationService } from '../../core/services';
import { Comment, Post } from '../../model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-comments',
  imports: [TimeAgoPipe, ReactiveFormsModule],
  templateUrl: './comments.html',
  styleUrl: './comments.css'
})
export class Comments {
  public authService=inject(AuthenticationService)
  private _snackBar = inject(MatSnackBar);
  private functions=inject(Functions)

  @Input() comments!: Comment[]
  @Input() post!:Post | undefined

  currentlyTyping=false
  commentControl=new FormControl('',[Validators.required])


  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }

  startTyping(){
    this.currentlyTyping=true
  }

  cancelTyping(){
    this.currentlyTyping=false
  }

   async sendComment(): Promise<void> {
    this.commentControl.markAsTouched(); 
    if (this.commentControl.invalid) {
      return;
    }

    const commentText = this.commentControl.value;
    const postCommentCallable = httpsCallable<any, any>(this.functions, 'postComment');

    try {
      if (!this.post?.id ) {
        console.error('Post ID is missing. Cannot post comment.');
        return;
      }

      const result = await postCommentCallable({
        postId: this.post?.id,
        text: commentText
      });

      if (result.data.success) {
        this.openSnackBar('Comment successfully posted!')
        this.commentControl.reset();
        this.cancelTyping()
      } else {
        this.openSnackBar(`Failed to post comment:, ${result.data.error}`)
      }
    } catch (error) {
      console.error('Error calling postComment function:', error);
    }
  }
}
