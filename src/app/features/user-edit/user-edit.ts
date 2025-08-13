import { Component, inject, OnInit } from '@angular/core';
import { FormBuilderService, UserService } from '../../core/services';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css'
})
export class UserEdit implements OnInit {
   private formBuilderService=inject(FormBuilderService)
   private userService=inject(UserService)

   userForm:FormGroup
   currentProfile=this.userService.userProfile

   constructor(){
    this.userForm=this.formBuilderService.createForm(3)
   }

  ngOnInit(): void {
    const data={
      username:this.currentProfile()?.username,
      bio:this.currentProfile()?.bio
    }

    this.userForm.patchValue(data)
  }

   get isUsernameInvalid():boolean{
    return this.formBuilderService.isUsernameError(this.userForm)
   }
   get usernameErrrorMessage():string{
    return this.formBuilderService.getUsernameErrorMessage(this.userForm)
   }

   onSubmit(){
    if (this.userForm.invalid) {
      this.formBuilderService.markFormGroupTouched(this.userForm)
      throw new Error('Form is invalid.')
    }
   }
}
