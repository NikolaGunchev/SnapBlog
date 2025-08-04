import { inject, Injectable, Signal, signal } from '@angular/core';
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
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { User } from '../../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private firebaseUser = toSignal<FirebaseUser | null>(user(this.auth), {
    initialValue: null,
  });
  private _isLogged = signal<boolean>(false);
  private _currentUser = signal<User | null>(null);

  public isLogged = this._isLogged.asReadonly();
  public currentUser = this._currentUser.asReadonly();
  public currentUser2: Signal<FirebaseUser | null> = this.firebaseUser;

  constructor(){
    const savedUser=localStorage.getItem('currentUser')
    if (savedUser) {
      this._isLogged.set(true)
    }
  }

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
          created_at: new Date(),
          groups: [],
          posts: [],
          comments: [],
        };

        const userDocRef = doc(this.firestore, `users/${uid}`);
        setDoc(userDocRef, user);

        
        this._currentUser.set(user);
        this._isLogged.set(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(() => {
        this.setUserData();
        this._isLogged.set(true);
        localStorage.setItem('currentUser',JSON.stringify(this._currentUser()?.username));
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        localStorage.removeItem('currentUser');
        this._isLogged.set(false)
        this._currentUser.set(null)
      })
    );
  }

  setUserData(){
    const userDocRef=doc(this.firestore, `users/${this.firebaseUser()?.uid}`)

    docData(userDocRef).subscribe(profile => {
      this._currentUser.set(profile as User)
    });
  }
}
