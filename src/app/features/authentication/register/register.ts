import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../core/services';
import { Router, RouterLink } from '@angular/router';
import { FormBuilderService } from '../../../core/services/formBuilder.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  public formBuilderService = inject(FormBuilderService);

  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.formBuilderService.createForm(1);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { username, email, password, rePassword } =
        this.formBuilderService.getRegisterFormValue(this.registerForm);

      this.authService.register(email, password, username).subscribe({
        next: () => {
          this.router.navigate(['']);
        },
        error: (err) => {
          this.openSnackBar(err.message)

          this.formBuilderService.markFormGroupTouched(this.registerForm);
        },
      });
    }
  }

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this._snackBar.open(message, 'close', {
      duration: 3000,
    });
  }

  get isUsernameInvalid(): boolean {
    return this.formBuilderService.isUsernameError(this.registerForm);
  }

  get isEmailInvalid(): boolean {
    return this.formBuilderService.isEmailError(this.registerForm);
  }

  get isPasswordInvalid(): boolean {
    return this.formBuilderService.isPasswordError(this.registerForm);
  }

  get isRePasswordInvalid(): boolean {
    return this.formBuilderService.isRePasswordError(this.registerForm);
  }

  get usernameErrorMessage(): string {
    return this.formBuilderService.getUsernameErrorMessage(this.registerForm);
  }

  get emailErrorMessage(): string {
    return this.formBuilderService.getEmailErrorMessage(this.registerForm);
  }

  get passwordErrorMessage(): string {
    return this.formBuilderService.getPasswordErrorMessage(this.registerForm);
  }

  get rePasswordErrorMessage(): string {
    return this.formBuilderService.getRePasswordErrorMessage(this.registerForm);
  }
}
