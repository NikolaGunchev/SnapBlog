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
          username: ['', [Validators.required, Validators.minLength(4)]],
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
                  Validators.minLength(6),
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
          username: ['', [Validators.required, Validators.minLength(4)]],
          bio: [''],
        });
        break;

      case 4:
        //group
        form = this.formBuilder.group({
          name: ['', [Validators.required, Validators.minLength(4)]],
          description: ['', [Validators.required, Validators.maxLength(50)]],
          images: this.formBuilder.group({
            logoImg: [''],
            bannerImg: [''],
          }),
          tags: ['', [Validators.required, this.minTagsValidator]],
          rules: [''],
        });
        break;

      case 5:
        //post
        form = this.formBuilder.group({
          title: ['', [Validators.required, Validators.minLength(5)]],
          content: ['', [Validators.required, Validators.minLength(5)]],
          image: [''],
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

  getLoginPasswordControl(form: FormGroup) {
    return form.get('password');
  }

  getNameControl(form: FormGroup) {
    return form.get('name');
  }

  getDescriptionControl(form: FormGroup) {
    return form.get('description');
  }

  getImagesGroupControl(form: FormGroup) {
    return form.get('images') as FormGroup;
  }

  getLogoImgControl(form: FormGroup) {
    return this.getImagesGroupControl(form).get('logoImg');
  }

  getBannerImgControl(form: FormGroup) {
    return this.getImagesGroupControl(form).get('bannerImg');
  }

  getTagsControl(form: FormGroup) {
    return form.get('tags');
  }

  getRulesControl(form: FormGroup) {
    return form.get('rules');
  }

  getTitleControl(form: FormGroup) {
    return form.get('title');
  }

  getContentControl(form: FormGroup) {
    return form.get('content');
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

  isLoginPasswordError(form: FormGroup): boolean {
    const control = this.getLoginPasswordControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isNameError(form: FormGroup): boolean {
    const control = this.getNameControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isDescriptionError(form: FormGroup): boolean {
    const control = this.getDescriptionControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isTagsError(form: FormGroup): boolean {
    const control = this.getTagsControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isTitleError(form: FormGroup): boolean {
    const control = this.getTitleControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  isContentError(form: FormGroup): boolean {
    const control = this.getTitleControl(form);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  getUsernameErrorMessage(form: FormGroup): string {
    const control = this.getUsernameControl(form);

    if (control?.errors?.['required']) {
      return 'Username is required';
    }
    if (control?.errors?.['minlength']) {
      return 'Username should have at least 4 symbols!';
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
      return 'Password should be at least 6 characters!';
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

  getLoginPasswordErrorMessage(form: FormGroup): string {
    const control = this.getLoginPasswordControl(form);

    if (control?.errors?.['required']) {
      return 'Password is required';
    }

    if (control?.errors?.['minlength']) {
      return 'Password must be atleast 5 characters';
    }

    return '';
  }

  getNameErrorMessage(form: FormGroup): string {
    const control = this.getNameControl(form);

    if (control?.errors?.['required']) {
      return 'Name is required';
    }
    if (control?.errors?.['minlength']) {
      return 'Name should have at least 4 symbols!';
    }
    return '';
  }

  getDescriptionErrorMessage(form: FormGroup): string {
    const control = this.getDescriptionControl(form);

    if (control?.errors?.['required']) {
      return 'Description is required';
    }
    if (control?.errors?.['maxlength']) {
      return 'Description is too long'
    }
    return '';
  }

  getTagsErrorMessage(form: FormGroup): string {
    const control = this.getTagsControl(form);

    if (control?.errors?.['required']) {
      return 'Tags are required';
    }
    if (control?.errors?.['lessTags']) {
      return 'Please enter atleast 3 tags';
    }
    return '';
  }

  getTitleErrorMessage(form: FormGroup): string {
    const control = this.getTitleControl(form);

    if (control?.errors?.['required']) {
      return 'Title is required';
    }
    if (control?.errors?.['minlength']) {
      return 'Title should have at least 5 symbols!';
    }
    return '';
  }

  getContentErrorMessage(form: FormGroup): string {
    const control = this.getContentControl(form);

    if (control?.errors?.['required']) {
      return 'Content is required';
    }
    if (control?.errors?.['minlength']) {
      return 'Content should have at least 5 symbols!';
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
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach((nestedKey) => {
          const nestedControl = control.get(nestedKey);
          nestedControl?.markAllAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
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

  private minTagsValidator(
    tagsControl: AbstractControl
  ): ValidationErrors | null {
    const tagsValue = tagsControl.value;

    if (!tagsValue || tagsValue.trim() === '') {
      return { lessTags: true };
    }

    const tags = tagsValue.trim().split(' ');

    const numberOfTags = tags.length;

    if (numberOfTags < 3) {
      return { lessTags: true };
    }

    return null;
  }
}
