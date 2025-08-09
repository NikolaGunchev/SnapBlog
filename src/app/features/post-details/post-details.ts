import { Component, inject, OnInit } from '@angular/core';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { Footer } from '../../shared/footer/footer';
import { SideGroup } from '../side-group/side-group';
import { PostsService, UserService } from '../../core/services';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Post } from '../../model';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';

@Component({
  selector: 'app-post-details',
  imports: [Footer, SideGroup, MenuIcons, CommonModule, TimeAgoPipe],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails implements OnInit{
  
  private postService=inject(PostsService)
  private router=inject(ActivatedRoute)
  private userService=inject(UserService)

  post$!:Observable<Post | undefined>
  readonly currentUser=this.userService.userProfile

  groupName!:string
  postId!:string

  ngOnInit(): void {
    this.groupName=this.router.snapshot.paramMap.get('name') ?? '';
    this.postId=this.router.snapshot.paramMap.get('id') ?? '';

    this.post$=this.postService.getPostById(this.postId)
  }
}
