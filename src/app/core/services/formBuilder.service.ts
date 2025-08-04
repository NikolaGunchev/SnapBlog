import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormBuilderService {
  private formBuilder = inject(FormBuilder);

  createForm(number: number): FormGroup {
    let form: FormGroup;

    switch (number) {
      //register
      case 1:
        form = this.formBuilder.group({
          username: ['', [Validators.required, Validators.minLength(5)]],
          email: [
            '',
            [
              Validators.required,
              Validators.pattern(
                /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
              ),
            ],
          ],
          passwords: this.formBuilder.group(
            {
              password: [
                '',
                [
                  Validators.required,
                  Validators.minLength(5),
                  Validators.pattern(/^[a-zA-Z0-9]+$/),
                ],
              ],
              rePassword: ['', [Validators.required]],
            },
            { validators: this.passwordMatchValidator }
          ),
        });
        break;

      case 2:
        //login
        form = this.formBuilder.group({
          email: [
            '',
            [
              Validators.required,
              Validators.pattern(
                /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
              ),
            ],
          ],
          password: ['', [Validators.required, Validators.minLength(5)]],
        });
        break;

      case 3:
        //profile-edit
        form = this.formBuilder.group({
          username: ['', [Validators.required, Validators.minLength(5)]],
          email: [
            '',
            [
              Validators.required,
              Validators.pattern(
                /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
              ),
            ],
          ],
        });
        break;

      default:
        throw new Error(`Unsupported form number: ${number}`);
    }

    return form;
  }

  getUsernameControl(form: FormGroup) {
    return form.get('username');
  }

  getEmailControl(form: FormGroup) {
    return form.get('email');
  }


  getPasswordsGroup(form: FormGroup) {
    return form.get('passwords') as FormGroup;
  }

  getPasswordControl(form: FormGroup) {
    return this.getPasswordsGroup(form).get('password');
  }

  getRePasswordControl(form: FormGroup) {
    return this.getPasswordsGroup(form).get('rePassword');
  }

  getLoginPasswordControl(form:FormGroup){
    return form.get('password');
  }

  isUsernameError(form: FormGroup): boolean {
    const control = this.getUsernameControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isEmailError(form: FormGroup): boolean {
    const control = this.getEmailControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isPasswordError(form: FormGroup): boolean {
    const passwordsGroup = this.getPasswordsGroup(form);
    return (
      (passwordsGroup?.invalid &&
        (passwordsGroup?.dirty || passwordsGroup?.touched)) ||
      false
    );
  }

  isRePasswordError(form: FormGroup): boolean {
    const passwordsGroup = this.getPasswordsGroup(form);
    return (
      (passwordsGroup?.invalid &&
        (passwordsGroup?.dirty || passwordsGroup?.touched)) ||
      false
    );
  }

  isLoginPasswordError(form:FormGroup):boolean{
    const control=this.getLoginPasswordControl(form)
    return (
      (control?.invalid &&
        (control?.dirty || control?.touched)) ||
      false
    );
  }

  getUsernameErrorMessage(form: FormGroup): string {
    const control = this.getUsernameControl(form);

    if (control?.errors?.['required']) {
      return 'Username is required';
    }
    if (control?.errors?.['minlength']) {
      return 'Username should have at least 5 symbols!';
    }
    return '';
  }

  getEmailErrorMessage(form: FormGroup): string {
    const control = this.getEmailControl(form);

    if (control?.errors?.['required']) {
      return 'Email is required';
    }
    if (control?.errors?.['pattern']) {
      return 'Please enter valid gmail address';
    }
    return '';
  }

  getPasswordErrorMessage(form: FormGroup): string {
    const control = this.getPasswordControl(form);
    const passwordsGroup = this.getPasswordsGroup(form);

    if (control?.errors?.['required']) {
      return 'Password is required';
    }
    if (control?.errors?.['minlength']) {
      return 'Password should be at least 5 characters!';
    }
    if (control?.errors?.['pattern']) {
      return 'Password should contain only English letters and digits!';
    }
    if (passwordsGroup?.errors?.['passwordMismatch']) {
      return 'Passwords do not match!';
    }
    return '';
  }

  getRePasswordErrorMessage(form: FormGroup): string {
    const control = this.getRePasswordControl(form);
    const passwordsGroup = this.getPasswordsGroup(form);

    if (control?.errors?.['required']) {
      return 'Password is required';
    }
    if (passwordsGroup?.errors?.['passwordMismatch']) {
      return 'Passwords do not match!';
    }
    return '';
  }

  getLoginPasswordErrorMessage(form:FormGroup):string{
    const control=this.getLoginPasswordControl(form)

    if (control?.errors?.['required']) {
      return 'Password is required';
    }

    if (control?.errors?.['minlength']) {
      return 'Password must be atleast 5 characters';
    }

    return '';
  }

  getRegisterFormValue(form: FormGroup) {
    const { username, email } = form.value;
    const { password, rePassword } = form.value.passwords;

    return {
      username,
      email,
      password,
      rePassword,
    };
  }

   markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          const nestedControl = control.get(nestedKey)
          nestedControl?.markAllAsTouched();
        })
      } else {
        control?.markAsTouched();
      }
    })
  }

  private passwordMatchValidator(
    passwordsControl: AbstractControl
  ): ValidationErrors | null {
    const password = passwordsControl.get('password');
    const rePassword = passwordsControl.get('rePassword');

    if (password && rePassword && password.value !== rePassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
