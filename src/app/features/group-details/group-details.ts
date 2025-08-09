import { Component, inject } from '@angular/core';
import { GroupsService, PostsService } from '../../core/services';
import { Group, Post } from '../../model';
import { combineLatest, map, Observable } from 'rxjs';
import { Dropdown } from "../../shared/dropdown/dropdown";
import { PostItem } from "../post-item/post-item";
import { Footer } from "../../shared/footer/footer";
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-details',
  imports: [Dropdown, PostItem, Footer, CommonModule],
  templateUrl: './group-details.html',
  styleUrl: './group-details.css',
})
export class GroupDetails {
  private postService = inject(PostsService);
  private groupService = inject(GroupsService)
  private router=inject(ActivatedRoute)
  
  combined$!: Observable<{ group: Group | undefined; posts: Post[] }>;

  groupName!:string;
  postId!:string
  

ngOnInit(): void {
  this.groupName=this.router.snapshot.paramMap.get('name') ?? '';
  this.postId=this.router.snapshot.paramMap.get('id') ?? '';

  this.combined$ = combineLatest([
    this.groupService.getGroupByName(this.groupName),
    this.postService.getPostsByGroupId(this.postId)
  ]).pipe(
    map(([group, posts]) => ({ group, posts }))
  );
}

}
