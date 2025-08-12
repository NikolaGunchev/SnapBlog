import { Component, inject, OnInit } from '@angular/core';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { Footer } from '../../shared/footer/footer';
import { SideGroup } from '../side-group/side-group';
import { AuthenticationService, PostsService, UserService } from '../../core/services';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
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
  public authService=inject(AuthenticationService)
  private commentsService=inject(CommentsService)
  
  public router=inject(ActivatedRoute)
  combined$!:Observable<{post:Post | undefined; comments:Comment[]}>
  readonly currentUser=this.userService.userProfile

  groupName!:string

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }

  ngOnInit(): void {
    this.groupName=this.router.snapshot.paramMap.get('name') ?? '';
    const postId=this.router.snapshot.paramMap.get('id') ?? '';

    this.combined$ = combineLatest([
      this.postService.getPostById(postId),
      this.commentsService.getCommentsByPostId(postId)
    ]).pipe(
      map(([post, comments])=>({post, comments}))
    )
  }
}
