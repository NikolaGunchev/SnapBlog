import { Component, inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Group, Post } from '../../model';
import { GroupsService } from '../../core/services/groups.service';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-item',
  imports: [CommonModule, TimeAgoPipe, RouterLink],
  templateUrl: './post-item.html',
  styleUrl: './post-item.css',
})
export class PostItem implements OnInit {
  private groupService = inject(GroupsService);
  isGroup: boolean = false;

  groupDetail$!: Observable<Group | undefined>;

  @Input() post!: Post;

  ngOnInit(): void {
    this.groupDetail$ = this.groupService.getGroupById(this.post.groupId);
  }
}
