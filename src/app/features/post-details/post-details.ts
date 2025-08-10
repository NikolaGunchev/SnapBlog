import { Component, inject, OnInit } from '@angular/core';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { Footer } from '../../shared/footer/footer';
import { SideGroup } from '../side-group/side-group';
import { AuthenticationService, PostsService, UserService } from '../../core/services';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Post } from '../../model';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-post-details',
  imports: [Footer, SideGroup, MenuIcons, CommonModule, TimeAgoPipe, RouterLink],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails implements OnInit{
  private postService=inject(PostsService)
  public router=inject(ActivatedRoute)
  private userService=inject(UserService)
  public authService=inject(AuthenticationService)

  post$!:Observable<Post | undefined>
  readonly currentUser=this.userService.userProfile

  groupName!:string
  postId!:string

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }

  ngOnInit(): void {
    this.groupName=this.router.snapshot.paramMap.get('name') ?? '';
    this.postId=this.router.snapshot.paramMap.get('id') ?? '';
  
    this.post$=this.postService.getPostById(this.postId)
    this.postService.postGroups.set(false)
  }
}
