import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../core/services';
import { Router, RouterLink } from '@angular/router';
import { FormBuilderService } from '../../../core/services/formBuilder.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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

    private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, "close", {
      duration:3000
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email,password).subscribe({
        next:()=>{
          this.router.navigate(['']);
        },
        error: (err) => {
          this.openSnackBar(err.message)
          
          this.formBuilderService.markFormGroupTouched(this.loginForm);
        },
      })

      
    }
  }
}
