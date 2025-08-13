import { Component, inject, OnInit } from '@angular/core';
import { FormBuilderService, UserService } from '../../core/services';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css'
})
export class UserEdit implements OnInit {
   private formBuilderService=inject(FormBuilderService)
   private userService=inject(UserService)
   private navigateRouter=inject(Router)

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

   async onSubmit(){
    if (this.userForm.invalid) {
      this.formBuilderService.markFormGroupTouched(this.userForm)
      throw new Error('Form is invalid.')
    }

    try {
      const result = await this.userService.editProfile({
          username: this.userForm.value.username,
          bio: this.userForm.value.bio
        })
      

      if (result.success) {
        this.navigateRouter.navigate(['/profile']);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Profile update failed', error);
      alert('An error occurred. Please try again.');
    }
   }
}
