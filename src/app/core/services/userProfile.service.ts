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
          return this.fetchUserProfile(firebaseUser.uid);
        } else {
          this._userProfile.set(null);
          return of(null);
        }
      })
    ).subscribe();
  }

  public fetchUserProfile(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef).pipe(
      tap((profileData: any) => {
        if (profileData && profileData.username) {
          const userModel: User = {
            id: uid,
            email: profileData.email || '',
            username: profileData.username,
            created_at: profileData.created_at.toDate(),
            groups: profileData.groups || [],
            posts: profileData.posts || [],
            comments: profileData.comments || [],
            likedPosts: profileData.likedPosts || [],
            dislikedPosts: profileData.dislikedPosts || [],
            bio: profileData.bio || ''
          };
          this._userProfile.set(userModel);
        } else {
          this._userProfile.set(null);
        }
      }),
      map(profile => profile as User | null)
    );
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
