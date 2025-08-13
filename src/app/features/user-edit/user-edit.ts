import { Component, inject } from '@angular/core';
import { FormBuilderService } from '../../core/services';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css'
})
export class UserEdit {
   private formBuilderService=inject(FormBuilderService)

   userForm:FormGroup

   constructor(){
    this.userForm=this.formBuilderService.createForm(3)
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
