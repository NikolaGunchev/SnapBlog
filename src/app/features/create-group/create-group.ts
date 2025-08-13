import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormBuilderService } from '../../core/services';
import { ImageUploadService } from '../../core/services/imageUpload.service';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Component({
  selector: 'app-create-group',
  imports: [ReactiveFormsModule],
  templateUrl: './create-group.html',
  styleUrl: './create-group.css'
})
export class CreateGroup {
  private formBuilderService=inject(FormBuilderService)
  private imagesService=inject(ImageUploadService)
  private function=inject(Functions)

  selectedFileLogo: File | null = null;
  selectedFileBanner: File | null = null;
  selectedImagePreviewLogo: string | ArrayBuffer | null = null;
  selectedImagePreviewBanner: string | ArrayBuffer | null = null;
  
  groupForm:FormGroup

  constructor(){
    this.groupForm=this.formBuilderService.createForm(4)
  }

  get isNameInvalid():boolean{
    return this.formBuilderService.isNameError(this.groupForm)
  }

  get isDescriptionInvalid():boolean{
    return this.formBuilderService.isDescriptionError(this.groupForm)
  }

  get isTagsInvalid():boolean{
    return this.formBuilderService.isTagsError(this.groupForm)
  }

  get nameErrorMessage():string{
    return this.formBuilderService.getNameErrorMessage(this.groupForm)
  }

  get descriptionErrorMessage():string{
    return this.formBuilderService.getDescriptionErrorMessage(this.groupForm)
  }

  get tagsErrorMessage():string{
    return this.formBuilderService.getTagsErrorMessage(this.groupForm)
  }

  async onSubmit():Promise<void>{
    if (!this.groupForm.valid) {
      this.formBuilderService.markFormGroupTouched(this.groupForm)
      return;
    }

    let logoImgUrl:string|undefined
    let bannerImgUrl:string|undefined

    try {
      if (this.selectedFileLogo) {
        logoImgUrl=await this.imagesService.uploadImage(this.selectedFileLogo, 'group-images/logos/')
      }

      if (this.selectedFileBanner) {
        bannerImgUrl=await this.imagesService.uploadImage(this.selectedFileBanner, 'group-images/banners/')
      }

      const formData=this.groupForm.value
      const dataToSend={
        name:formData.name,
        description:formData.description,
        tags:formData.tags,
        rules:formData.rules,
        logoImgUrl:logoImgUrl,
        bannerImgUrl:bannerImgUrl
      }

      const createGroupCallable=httpsCallable<any,any>(this.function, 'CreateGroup')
      const result=await createGroupCallable(dataToSend)

      console.log('Cloud Function result:', result.data);
      if (result.data.success) {
        console.log('Group created successfully! Group ID:', result.data.groupId);
      } else {
        console.error('Failed to create group via Cloud Function:', result.data.error);
      }
    } catch (error) {
      console.error("Error during group creation process:", error)
    }
  }


   onFileSelectedLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileLogo = input.files[0];
      this.previewImageLogo();
    } else {
      this.selectedFileLogo = null;
      this.selectedImagePreviewLogo = null;
    }
  }

  onFileSelectedBanner(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileBanner = input.files[0];
      this.previewImageBanner();
    } else {
      this.selectedFileBanner = null;
      this.selectedImagePreviewBanner = null;
    }
  }

  previewImageLogo(): void {
    if (this.selectedFileLogo) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreviewLogo = reader.result;
      };
      reader.readAsDataURL(this.selectedFileLogo);
    }
  }

   previewImageBanner(): void {
    if (this.selectedFileBanner) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreviewBanner = reader.result;
      };
      reader.readAsDataURL(this.selectedFileBanner);
    }
  }

  removeImageLogo(): void {
    this.selectedFileLogo = null;
    this.selectedImagePreviewLogo = null;

    const fileInput = document.getElementById('groupImg') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeImageBanner(): void {
    this.selectedFileBanner = null;
    this.selectedImagePreviewBanner = null;

    const fileInput = document.getElementById('bannerImg') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }



}
