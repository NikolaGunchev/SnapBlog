import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilderService,
  GroupsService,
  PostsService,
  UserService,
} from '../../core/services';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadService } from '../../core/services/imageUpload.service';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { Group, Post } from '../../model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-post',
  imports: [ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost implements OnInit, OnDestroy {
  private formBuilderService = inject(FormBuilderService);
  private router = inject(ActivatedRoute);
  private groupService = inject(GroupsService);
  private imagesService = inject(ImageUploadService);
  private functions = inject(Functions);
  private postService = inject(PostsService);
  private subscriptions!: Subscription;
  private navigateRouter = inject(Router);
  private userService=inject(UserService)

  selectedFile: File | null = null;
  selectedImagePreview: string | ArrayBuffer | null = null;
  existingImageUrl: string | null = null;

  groupDetails$!: Observable<Group | undefined>;
  postForm: FormGroup;

  currentUser=this.userService.userProfile
  groupName = this.router.snapshot.paramMap.get('name');

  constructor() {
    this.postForm = this.formBuilderService.createForm(5);
    this.groupDetails$ = this.groupService.getGroupByName(this.groupName!);
  }

  postId = this.router.snapshot.queryParamMap.get('edit');
  isEditing = this.postId !== null ? true : false;
  postDetails$!: Observable<Post | undefined>;

  ngOnInit(): void {
    if (this.postId !== null) {
      this.postDetails$ = this.postService.getPostById(this.postId);

      this.subscriptions = this.postDetails$.subscribe((post) => {
        this.existingImageUrl = post?.imageUrl || null;
        this.selectedImagePreview = post?.imageUrl || null;

        const data = {
          title: post?.title,
          content: post?.content,
        };

        this.postForm.patchValue(data);
      });
    }
  }

  get isTitleInvalid(): boolean {
    return this.formBuilderService.isTitleError(this.postForm);
  }

  get isContentInvalid(): boolean {
    return this.formBuilderService.isContentError(this.postForm);
  }

  get titleErrorMessage(): string {
    return this.formBuilderService.getTitleErrorMessage(this.postForm);
  }

  get contentErrorMessage(): string {
    return this.formBuilderService.getContentErrorMessage(this.postForm);
  }

  async onSubmit(): Promise<void> {
    if (this.postForm.invalid) {
      this.formBuilderService.markFormGroupTouched(this.postForm);
      throw new Error('Form is invalid.');
    }

    if (!this.isEditing) {
      try {
        const groupDetails = await firstValueFrom(this.groupDetails$);
        if (!groupDetails) {
          throw new Error('Group details not found. Cannot create post.');
        }

        const groupId = groupDetails.id;
        let imageUrl: string | undefined;

        if (this.selectedFile) {
          imageUrl = await this.imagesService.uploadImage(
            this.selectedFile,
            `post-images/${groupId}/`
          );
        }

        const formData = this.postForm.value;
        const dataToSend = {
          title: formData.title,
          content: formData.content,
          imageUrl: imageUrl,
          groupId: groupId,
          creatorName:this.currentUser()?.username,
        };

        const result=await this.postService.createPost(dataToSend)


        if (result.success) {
          this.navigateRouter.navigate(['/group', this.groupName])
        }
      } catch (error) {
        console.error('Error during post creation process:', error);
      }
    } else {
      try {
        const formValue = this.postForm.value;
        let newImageUrl: string | null | undefined;

        if (this.selectedFile) {
          const groupDetails = await firstValueFrom(this.groupDetails$);
          if (!groupDetails) {
            throw new Error('Group details not found. Cannot update post.');
          }
          newImageUrl = await this.imagesService.uploadImage(
            this.selectedFile,
            `post-images/${groupDetails.id}/`
          );
        } else if (this.existingImageUrl) {
          newImageUrl = this.existingImageUrl;
        } else {
          newImageUrl = null;
        }

        const editData = {
          postId: this.postId!,
          title: formValue.title,
          content: formValue.content,
          newImageUrl: newImageUrl,
        };

        const resultEdit=await this.postService.editPost(editData)


        if (resultEdit.success) {
          this.navigateRouter.navigate(['/group', this.groupName]);
        }
      } catch (error) {
        console.error('Error during post edit process:', error);
      }
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
    this.existingImageUrl = null;
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
    this.existingImageUrl = null;

    const fileInput = document.getElementById('groupImg') as HTMLInputElement;
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
