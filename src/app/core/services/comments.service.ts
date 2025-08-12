import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  CollectionReference,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { firstValueFrom, Observable, take } from 'rxjs';
import { Comment } from '../../model';
import { Functions, httpsCallableData } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private firestore = inject(Firestore);
  private functions=inject(Functions)

  getCommentsByPostId(postId: string): Observable<Comment[]> {
    const trimmedPostId = postId.trim();

    const commentsSubCollRef = collection(
      this.firestore,
      `posts/${trimmedPostId}/comments`
    ) as CollectionReference<Comment>;

    return collectionData<Comment>(commentsSubCollRef, { idField: 'id' }).pipe(
      take(1)
    );
  }

  async deleteComment(postId: string, commentId: string): Promise<{ success: boolean; error?: string }> {
    const callable = httpsCallableData<any, { success: boolean; error?: string }>(this.functions, 'deleteComment');
    const result = await firstValueFrom(callable({ postId, commentId }));
    return result;
  }
}
