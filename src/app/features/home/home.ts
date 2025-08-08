import { Component, inject, OnInit } from '@angular/core';
import { PostsService } from '../../core/services';
import { Post } from '../../model';
import { Observable } from 'rxjs';
import { PostItem } from '../post-item/post-item';
import { CommonModule } from '@angular/common';
import { Dropdown } from '../../shared/dropdown/dropdown';

@Component({
  selector: 'app-home',
  imports: [PostItem, CommonModule, Dropdown],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private postService = inject(PostsService);
   posts$!: Observable<Post[]>;

  ngOnInit(): void {
    this.posts$ = this.postService.getPosts();
  }
}
