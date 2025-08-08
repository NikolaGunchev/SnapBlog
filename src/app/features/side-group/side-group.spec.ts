import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideGroup } from './side-group';

describe('SideGroup', () => {
  let component: SideGroup;
  let fixture: ComponentFixture<SideGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
