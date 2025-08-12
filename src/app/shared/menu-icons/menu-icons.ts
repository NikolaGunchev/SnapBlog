import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-menu-icons',
  imports: [],
  templateUrl: './menu-icons.html',
  styleUrl: './menu-icons.css'
})
export class MenuIcons {
  @Output() editClicked = new EventEmitter<void>(); 
  @Output() deleteClicked = new EventEmitter<void>();

 showMenu = false;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  hideMenu(): void {
    this.showMenu = false;
  }

  onEdit(): void {
    this.editClicked.emit(); 
  }

  onDelete(): void {
    this.deleteClicked.emit();
  }
}
