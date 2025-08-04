import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../core/services';
import { Router } from '@angular/router';
import { FormBuilderService } from '../../../core/services/formBuilder.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService=inject(AuthenticationService)
  private router=inject(Router)
  public formBuilderService=inject(FormBuilderService)

  loginForm:FormGroup;

  constructor(){
    this.loginForm=this.formBuilderService.createForm(2)
  }

  get isEmailValid(): boolean {
   return this.formBuilderService.isEmailError(this.loginForm)
  }

  get isPasswordValid(): boolean {
    return this.formBuilderService.isLoginPasswordError(this.loginForm)
  }

  get emailErrorMessage(): string {
    return this.formBuilderService.getEmailErrorMessage(this.loginForm)
  }

  get passwordErrorMessage(): string {
    return this.formBuilderService.getLoginPasswordErrorMessage(this.loginForm)
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      const response=this.authService.login(email,password)

      if (response) {
        this.router.navigate(['']);
      }
    }
  }
}
