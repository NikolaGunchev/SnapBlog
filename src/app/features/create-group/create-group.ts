import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormBuilderService, GroupsService } from '../../core/services';
import { ImageUploadService } from '../../core/services/imageUpload.service';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Group } from '../../model';

@Component({
  selector: 'app-create-group',
  imports: [ReactiveFormsModule],
  templateUrl: './create-group.html',
  styleUrl: './create-group.css',
})
export class CreateGroup implements OnInit, OnDestroy {
  private formBuilderService = inject(FormBuilderService);
  private imagesService = inject(ImageUploadService);
  private function = inject(Functions);
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupsService);
  private subscriptions!: Subscription;
  private navigateRouter=inject(Router)

  selectedFileLogo: File | null = null;
  selectedFileBanner: File | null = null;
  selectedImagePreviewLogo: string | ArrayBuffer | null = null;
  selectedImagePreviewBanner: string | ArrayBuffer | null = null;
  existingLogoUrl: string | null = null;
  existingBannerUrl: string | null = null;

  groupForm: FormGroup;

  groupId = this.route.snapshot.queryParamMap.get('edit');
  isEditing = this.groupId !== null ? true : false;
  groupDetails$!: Observable<Group | undefined>;

  constructor() {
    this.groupForm = this.formBuilderService.createForm(4);
  }

  ngOnInit(): void {
    if (this.groupId !== null) {
      this.groupDetails$ = this.groupService.getGroupById(this.groupId);

      this.subscriptions = this.groupDetails$.subscribe((group) => {
        this.existingLogoUrl = group?.logoImgUrl || null;
        this.existingBannerUrl = group?.bannerImgUrl || null;

        this.selectedImagePreviewLogo = group?.logoImgUrl || null;
        this.selectedImagePreviewBanner = group?.bannerImgUrl || null;

        const data = {
          name: group?.name,
          description: group?.description,
          tags: group?.tags.join(' '),
          rules: group?.rules || '',
        };

        this.groupForm.patchValue(data);
      });
    }
  }

  get isNameInvalid(): boolean {
    return this.formBuilderService.isNameError(this.groupForm);
  }

  get isDescriptionInvalid(): boolean {
    return this.formBuilderService.isDescriptionError(this.groupForm);
  }

  get isTagsInvalid(): boolean {
    return this.formBuilderService.isTagsError(this.groupForm);
  }

  get nameErrorMessage(): string {
    return this.formBuilderService.getNameErrorMessage(this.groupForm);
  }

  get descriptionErrorMessage(): string {
    return this.formBuilderService.getDescriptionErrorMessage(this.groupForm);
  }

  get tagsErrorMessage(): string {
    return this.formBuilderService.getTagsErrorMessage(this.groupForm);
  }

  async onSubmit(): Promise<void> {
    if (!this.groupForm.valid) {
      this.formBuilderService.markFormGroupTouched(this.groupForm);
      return;
    }

    if (!this.isEditing) {
      let logoImgUrl: string | undefined;
      let bannerImgUrl: string | undefined;
  
      try {
        if (this.selectedFileLogo) {
          logoImgUrl = await this.imagesService.uploadImage(
            this.selectedFileLogo,
            'group-images/logos/'
          );
        }
  
        if (this.selectedFileBanner) {
          bannerImgUrl = await this.imagesService.uploadImage(
            this.selectedFileBanner,
            'group-images/banners/'
          );
        }
  
        const formData = this.groupForm.value;
        const dataToSend = {
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
          rules: formData.rules,
          logoImgUrl: logoImgUrl,
          bannerImgUrl: bannerImgUrl,
        };
  
        const result=await this.groupService.createGroup(dataToSend)
  
        if (result.success) {
          this.navigateRouter.navigate(['/group', formData.name])
        }
      } catch (error) {
        console.error('Error during group creation process:', error);
      }
    }else{
    try {
      const formData = this.groupForm.value;
      let newLogoUrl: string | null | undefined;
      let newBannerUrl: string | null | undefined;

      if (this.selectedFileLogo) {
        newLogoUrl = await this.imagesService.uploadImage(
          this.selectedFileLogo,
          'group-images/logos/'
        );
      } else if (this.existingLogoUrl) {
        newLogoUrl = this.existingLogoUrl;
      } else {
        newLogoUrl = null;
      }

      if (this.selectedFileBanner) {
        newBannerUrl = await this.imagesService.uploadImage(
          this.selectedFileBanner,
          'group-images/banners/'
        );
      } else if (this.existingBannerUrl) {
        newBannerUrl = this.existingBannerUrl;
      } else {
        newBannerUrl = null;
      }

      const editData = {
        groupId: this.groupId!,
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        rules: formData.rules,
        newLogoImgUrl: newLogoUrl,
        newBannerImgUrl: newBannerUrl,
      };

      const resultEdit=await this.groupService.editGroup(editData)


      if (resultEdit.success) {
        this.navigateRouter.navigate(['/group', formData.name]);
      }
    } catch (error) {
      console.error('Error during group edit process:', error);
    }
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
    this.existingLogoUrl = null;
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
    this.existingBannerUrl = null;
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
    this.existingLogoUrl = null;

    const fileInput = document.getElementById('groupImg') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeImageBanner(): void {
    this.selectedFileBanner = null;
    this.selectedImagePreviewBanner = null;
    this.existingBannerUrl = null;

    const fileInput = document.getElementById('bannerImg') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
