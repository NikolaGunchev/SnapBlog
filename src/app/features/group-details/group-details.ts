import { Component, inject } from '@angular/core';
import { AuthenticationService, GroupsService, PostsService, UserService } from '../../core/services';
import { Group, Post } from '../../model';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Dropdown } from "../../shared/dropdown/dropdown";
import { PostItem } from "../post-item/post-item";
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TransformNamePipe } from '../../shared/pipes/transform-name-pipe';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-details',
  imports: [Dropdown, PostItem, CommonModule, TransformNamePipe, DatePipe],
  templateUrl: './group-details.html',
  styleUrl: './group-details.css',
})
export class GroupDetails {
  private postService = inject(PostsService);
  public groupService = inject(GroupsService)
  private userService=inject(UserService)
  
  private router=inject(ActivatedRoute)
  public authService=inject(AuthenticationService)

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }


  public joined:boolean | undefined
  
  combined$!: Observable<{ group: Group | undefined; posts: Post[] }>;
  group$!:Observable<Group |undefined>

  groupName!:string;
  postId!:string

  

ngOnInit(): void {

  
  this.groupName=this.router.snapshot.paramMap.get('name') ?? '';
  this.postId=this.router.snapshot.paramMap.get('id') ?? '';

  this.group$=this.groupService.getGroupByName(this.groupName)

   this.combined$ = this.group$.pipe(
      switchMap(group => {
        if (group) {
          const posts$ = this.postService.getPostsByGroupId(group.id);

          this.joined=this.userService.userProfile()?.groups.includes(group.id)
          
          return combineLatest([of(group), posts$]).pipe(
            map(([group, posts]) => ({ group, posts}))
          );
        } else {
          return of({ group: undefined, posts: [] });
        }
      })
    ); 
}
}
