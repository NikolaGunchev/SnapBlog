import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  Auth,
  user,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map, Observable, switchMap } from 'rxjs';
import { doc, Firestore, serverTimestamp, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private firebaseUser = toSignal<FirebaseUser | null>(user(this.auth), {
    initialValue: null,
  });

  public currentUser: Signal<FirebaseUser | null> =this.firebaseUser
  public isLoggedIn:Signal<boolean>=computed(()=> !!this.currentUser())

  register(
    email: string,
    password: string,
    username: string
  ): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap(userCredential =>{
        const uid = userCredential.user.uid;
        const userDocRef = doc(this.firestore, `users/${uid}`);

        const user = {
          id: uid,
          email: email,
          username: username,
          created_at: serverTimestamp(),
          groups: [],
          posts: [],
          comments: [],
          likedPosts:[],
          dislikedPosts:[],
          bio:''
        };

        return from(setDoc(userDocRef, user)).pipe(
          map(() => userCredential)
        )
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password))
  }

  logout(): Observable<void> {
    return from(signOut(this.auth))
  }
}
