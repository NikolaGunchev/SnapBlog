import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuIcons } from './menu-icons';

describe('MenuIcons', () => {
  let component: MenuIcons;
  let fixture: ComponentFixture<MenuIcons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuIcons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuIcons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
