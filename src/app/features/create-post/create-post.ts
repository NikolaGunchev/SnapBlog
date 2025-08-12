import { Component, inject } from '@angular/core';
import { FormBuilderService, GroupsService } from '../../core/services';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadService } from '../../core/services/imageUpload.service';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { Group } from '../../model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-post',
  imports: [ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css'
})
export class CreatePost {
  private formBuilderService=inject(FormBuilderService)
  private router=inject(ActivatedRoute)
  private groupService=inject(GroupsService)
  private imagesService=inject(ImageUploadService)
  private functions=inject(Functions)

  selectedFile: File | null = null;
  selectedImagePreview: string | ArrayBuffer | null = null;
  
  groupDetails$!:Observable<Group | undefined>
  postForm:FormGroup

  groupName=this.router.snapshot.paramMap.get('name')

  constructor(){
    this.postForm=this.formBuilderService.createForm(5)
    this.groupDetails$=this.groupService.getGroupByName(this.groupName!)


  }

  get isTitleInvalid():boolean{
    return this.formBuilderService.isTitleError(this.postForm)
  }

  get isContentInvalid():boolean{
    return this.formBuilderService.isContentError(this.postForm)
  }

  get titleErrorMessage():string{
    return this.formBuilderService.getTitleErrorMessage(this.postForm)
  }

  get contentErrorMessage():string{
    return this.formBuilderService.getContentErrorMessage(this.postForm)
  }

  async onSubmit(): Promise<void> {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      throw new Error('Form is invalid.')
    }

    try {
      const groupDetails = await firstValueFrom(this.groupDetails$);
      if (!groupDetails) {
        throw new Error('Group details not found. Cannot create post.')
      }
      
      const groupId = groupDetails.id;
      let imageUrl: string | undefined;

      if (this.selectedFile) {
        imageUrl = await this.imagesService.uploadImage(this.selectedFile, `post-images/${groupId}/`);
      }

      const formData = this.postForm.value;
      const dataToSend = {
        title: formData.title,
        content: formData.content,
        imageUrl: imageUrl,
        groupId: groupId,
      };

      const createPostCallable = httpsCallable<any, any>(this.functions, 'createPost');
      const result = await createPostCallable(dataToSend);

      if (result.data.success) {
      } else {
        throw new Error('Failed to create post:', result.data.error )
      }
    } catch (error) {
      console.error('Error during post creation process:', error);
    }
  }

  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.previewImage();
    } else {
      this.selectedFile = null;
      this.selectedImagePreview = null;
    }
  }

  previewImage(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.selectedImagePreview = null;

    const fileInput = document.getElementById('groupImg') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
