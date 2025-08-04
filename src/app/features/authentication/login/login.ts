import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../core/services';
import { Router, RouterLink } from '@angular/router';
import { FormBuilderService } from '../../../core/services/formBuilder.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
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

  get isEmailInvalid(): boolean {
   return this.formBuilderService.isEmailError(this.loginForm)
  }

  get isPasswordInvalid(): boolean {
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

      this.authService.login(email,password).subscribe({
        next:()=>{
          this.router.navigate(['']);
        },
        error: (err) => {
          console.log(err);
          
          this.formBuilderService.markFormGroupTouched(this.loginForm);
        },
      })

      
    }
  }
}
