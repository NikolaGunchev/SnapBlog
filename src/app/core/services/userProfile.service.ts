import { inject, Injectable, signal } from '@angular/core';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { AuthenticationService } from './authentication.service';
import { FunctionResponse, User } from '../../model';
import { firstValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';
import { userConverter } from './firestoreConverter.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Functions, httpsCallableData } from '@angular/fire/functions';

interface EditProfileDataClient {
  username?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private authService = inject(AuthenticationService);
  private functions=inject(Functions)

  private _userProfile = signal<User | null>(null);

  public userProfile = this._userProfile.asReadonly();

 constructor() {
    const user$ = toObservable(this.authService.currentUser);
    
    user$.pipe(
      switchMap((firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
          return docData(userDocRef).pipe(
            tap((profile) => {
                const userModel: User = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  username: (profile as any).username,
                  created_at: (profile as any).created_at.toDate(),
                  groups: (profile as any).groups || [],
                  posts: (profile as any).posts || [],
                  comments: (profile as any).comments || [],
                  likedPosts: (profile as any).likedPosts || [],
                  dislikedPosts: (profile as any).dislikedPosts || [],
                  bio:(profile as any).bio
                };
                this._userProfile.set(userModel);
            })
          );
        } else {
          return of(null).pipe(
            tap(() => {
              this._userProfile.set(null);
            })
          );
        }
      })
    ).subscribe();
  }

  getUserById(userId: string): Observable<User | undefined> {
    const trimmedUserId = userId.trim();

    const userDocRef = doc(
      this.firestore,
      'users',
      trimmedUserId
    ).withConverter(userConverter);

    return docData(userDocRef).pipe(
      map((userData) => {
        if (userData) {
          return userData;
        } else {
          return undefined;
        }
      })
    );
  }

  async deleteUserAccount(): Promise<FunctionResponse> {
    const callable = httpsCallableData<void, FunctionResponse>(this.functions, 'deleteUserAccount');
    const result = await firstValueFrom(callable());
    return result;
  }

  async editProfile(data: EditProfileDataClient): Promise<FunctionResponse> {
    const callable = httpsCallableData<EditProfileDataClient, FunctionResponse>(this.functions, 'editProfile');
    const result = await firstValueFrom(callable(data));
    return result;
  }
}
