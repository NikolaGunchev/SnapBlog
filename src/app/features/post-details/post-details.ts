import { Component } from '@angular/core';
import { MenuIcons } from '../../shared/menu-icons/menu-icons';
import { Footer } from '../../shared/footer/footer';
import { SideGroup } from '../side-group/side-group';

@Component({
  selector: 'app-post-details',
  imports: [Footer, SideGroup, MenuIcons],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails {

}
