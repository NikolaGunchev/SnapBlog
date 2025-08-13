import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthenticationService, UserService } from '../../core/services';
import { Comment, Post } from '../../model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { CommentsService } from '../../core/services/comments.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comments',
  imports: [TimeAgoPipe, ReactiveFormsModule, MenuIcons],
  templateUrl: './comments.html',
  styleUrl: './comments.css'
})
export class Comments {
  private commentService=inject(CommentsService)
  private _snackBar = inject(MatSnackBar);
  private functions=inject(Functions)
  private userService=inject(UserService)
  private navigateRoute=inject(Router)
  
  public authService=inject(AuthenticationService)

  @Input() comments!: Comment[]
  @Input() post!:Post | undefined
  @Output() commentChange = new EventEmitter<void>();

  currentlyTyping=false
  commentControl=new FormControl('',[Validators.required])
  currentUser=this.userService.userProfile


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
        text: commentText,
        creatorName:this.currentUser()?.username
      });

      if (result.data.success) {
        this.openSnackBar('Comment successfully posted!')
        this.cancelTyping()
        this.commentControl.reset()
        this.commentChange.emit()
      } else {
        this.openSnackBar(`Failed to post comment:, ${result.data.error}`)
      }
    } catch (error) {
      console.error('Error calling postComment function:', error);
    }
  }

  handleEditClicked(comment: Comment): void {
    console.log('Editing comment:', comment.id, 'Text:', comment.text);
  }

  async deleteComment(postId:string,commentId:string):Promise<void>{
    const confirmed = confirm("Are you sure you want to delete this comment!")
    if (confirmed) {
      try {
        const result = await this.commentService.deleteComment(postId,commentId)
        if (result.success) {
          this.openSnackBar("Successfully deleted the comment")
          this.commentChange.emit()
        } else {
          this.openSnackBar(`Failed to delete comment: ${result.error}`)
        }
      } catch (error) {
        console.error("Something happend while deleting the comment", error)
      }
    }
  }
}
