import { Component, inject } from '@angular/core';
import {
  AuthenticationService,
  GroupsService,
  PostsService,
  UserService,
} from '../../core/services';
import { Group, Post } from '../../model';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Dropdown } from '../../shared/dropdown/dropdown';
import { PostItem } from '../post-item/post-item';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransformNamePipe } from '../../shared/pipes/transform-name-pipe';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-details',
  imports: [
    Dropdown,
    PostItem,
    CommonModule,
    TransformNamePipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './group-details.html',
  styleUrl: './group-details.css',
})
export class GroupDetails {
  private postService = inject(PostsService);
  private userService = inject(UserService);
  private router = inject(ActivatedRoute);
  private navigateRoute = inject(Router);

  public groupService = inject(GroupsService);
  public authService = inject(AuthenticationService);

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, 'close', {
      duration: 3000,
    });
  }

  public joined: boolean | undefined;
  public currentUser = this.userService.userProfile;

  combined$!: Observable<{ group: Group | undefined; posts: Post[] }>;
  group$!: Observable<Group | undefined>;

  groupName!: string;
  postId!: string;

  ngOnInit(): void {
    this.groupName = this.router.snapshot.paramMap.get('name') ?? '';
    this.postId = this.router.snapshot.paramMap.get('id') ?? '';

    this.group$ = this.groupService.getGroupByName(this.groupName);

    this.combined$ = this.group$.pipe(
      switchMap((group) => {
        if (group) {
          const posts$ = this.postService.getPostsByGroupId(group.id);

          this.joined = this.userService
            .userProfile()
            ?.groups.includes(group.id);

          return combineLatest([of(group), posts$]).pipe(
            map(([group, posts]) => ({ group, posts }))
          );
        } else {
          return of({ group: undefined, posts: [] });
        }
      })
    );
  }

  async deleteGroup(groupId: string): Promise<void> {
    const confirmed = confirm('Are you sure you want to delete this gorup!');
    if (confirmed) {
      try {
        const result = await this.groupService.deleteGroup(groupId);
        if (result.success) {
          this.openSnackBar('Successfully deleted the group');
          this.navigateRoute.navigate(['/']);
        } else {
          this.openSnackBar(`Failed to delete group: ${result.error}`);
        }
      } catch (error) {
        console.error('Something happend while deleting the group');
      }
    }
  }

  editPage(groupId: string | undefined) {
    this.navigateRoute.navigate(['/create-group'], {
      queryParams: { edit: groupId },
    });
  }
}
