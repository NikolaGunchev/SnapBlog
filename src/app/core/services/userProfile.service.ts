import { effect, inject, Injectable, signal } from '@angular/core';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { AuthenticationService } from './authentication.service';
import { User } from '../../model';
import { map, Observable } from 'rxjs';
import { userConverter } from './firestoreConverter.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private authService = inject(AuthenticationService);

  private _userProfile = signal<User | null>(null);

  public userProfile = this._userProfile.asReadonly();

  constructor() {
    effect(() => {
      const firebaseUser = this.authService.currentUser();

      if (firebaseUser) {
        const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);

        docData(userDocRef).subscribe((profile) => {
          if (profile) {
            const userModel: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: (profile as any).username,
              created_at: (profile as any).created_at.toDate(),
              groups: (profile as any).groups || [],
              posts: (profile as any).posts || [],
              comments: (profile as any).comments || [],
              likedPosts: (profile as any).likedPosts || []
            };
            this._userProfile.set(userModel);
          } else {
            this._userProfile.set(null);
          }
        });
      } else {
        this._userProfile.set(null);
      }
    });
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
}
