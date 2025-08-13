import { Component, inject, OnInit } from '@angular/core';
import { PostsService } from '../../core/services';
import { Post } from '../../model';
import { Observable } from 'rxjs';
import { PostItem } from '../post-item/post-item';
import { CommonModule } from '@angular/common';
import { SideGroup } from '../side-group/side-group';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-home',
  imports: [PostItem, CommonModule, SideGroup, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private postService = inject(PostsService);
   homePosts$!: Observable<Post[]>;

  ngOnInit(): void {
    this.homePosts$ = this.postService.getPosts();

    
  }
}
