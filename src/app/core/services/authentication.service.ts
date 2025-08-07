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
import { from, Observable, tap } from 'rxjs';
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
      tap((userCredential) => {
        const uid = userCredential.user.uid;

        const user = {
          id: uid,
          email: email,
          username: username,
          created_at: serverTimestamp(),
          groups: [],
          posts: [],
          comments: [],
        };

        const userDocRef = doc(this.firestore, `users/${uid}`);
        setDoc(userDocRef, user);

        console.log('User registered and profile created in Firestore!');
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(() => {
        console.log('User logged in successfully.');
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        console.log("User logged out successfully.");
      })
    );
  }
}
