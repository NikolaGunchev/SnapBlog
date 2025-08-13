import { Component, inject, OnInit } from '@angular/core';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { Footer } from '../../shared/footer/footer';
import { SideGroup } from '../side-group/side-group';
import { AuthenticationService, PostsService, UserService } from '../../core/services';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subject, switchMap } from 'rxjs';
import { Comment, Post } from '../../model';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import {MatSnackBar} from '@angular/material/snack-bar';
import { CommentsService } from '../../core/services/comments.service';
import { Comments } from '../comments/comments';

@Component({
  selector: 'app-post-details',
  imports: [Footer, SideGroup, MenuIcons, CommonModule, TimeAgoPipe, RouterLink, Comments],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails implements OnInit{
  private postService=inject(PostsService)
  private userService=inject(UserService)
  private commentsService=inject(CommentsService)
  private navigateRoute=inject(Router)
  
  public authService=inject(AuthenticationService)
  public router=inject(ActivatedRoute)
  
  post$!:Observable<Post | undefined>
  comments$!:Observable<Comment[]>

  readonly currentUser=this.userService.userProfile
  groupName!:string
  private _snackBar = inject(MatSnackBar);

  private getComments$=new Subject<void>()

  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }

  ngOnInit(): void {
    this.groupName=this.router.snapshot.paramMap.get('name') ?? '';
    const postId=this.router.snapshot.paramMap.get('id') ?? '';

    this.post$=this.postService.getPostById(postId)
    this.comments$=this.getComments$.pipe(
      startWith(undefined),
      switchMap(() => this.commentsService.getCommentsByPostId(postId))
    )
  }

  refreshComments(): void {
    this.getComments$.next();
  }

  editPage(groupName: string | undefined, postId: string | undefined) {
    this.navigateRoute.navigate(['/group', groupName, 'create-post'], {
      queryParams: { edit: postId },
    });
  }
  
  async deletePost(postId:string):Promise<void>{
    const confirmed = confirm("Are you sure you want to delete this post!")
    if (confirmed) {
      try {
        const result = await this.postService.deletePost(postId)
        if (result.success) {
          this.openSnackBar("Successfully deleted the post")
          this.navigateRoute.navigate(['/'])
        } else {
          this.openSnackBar(`Failed to delete post: ${result.error}`)
        }
      } catch (error) {
        console.error("Something happend while deleting the post")
      }
    }
  }
}
