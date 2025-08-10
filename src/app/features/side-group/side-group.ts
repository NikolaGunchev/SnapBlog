import { Component, inject, OnInit } from '@angular/core';
import { GroupsService } from '../../core/services';
import { Observable } from 'rxjs';
import { Group } from '../../model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-group',
  imports: [CommonModule, RouterLink],
  templateUrl: './side-group.html',
  styleUrl: './side-group.css'
})
export class SideGroup implements OnInit{
 
 private groupsService=inject(GroupsService)

 topFiveGroups$!:Observable<Group[]>

ngOnInit(): void {
   this.topFiveGroups$=this.groupsService.getTopFiveGroups()
 }
}
