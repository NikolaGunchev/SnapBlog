import {Component} from '@angular/core';

@Component({
  selector: 'app-menu-icons',
  imports: [],
  templateUrl: './menu-icons.html',
  styleUrl: './menu-icons.css'
})
export class MenuIcons {
 showMenu = false;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  hideMenu(): void {
    this.showMenu = false;
  }
}
