import { inject, Injectable, Signal, signal } from "@angular/core";
import { Auth, user, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut, UserCredential } from "@angular/fire/auth";
import { toSignal } from "@angular/core/rxjs-interop";
import { from, Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root"
})

export class AuthenticationService{
  private auth = inject(Auth)

  private firebaseUser = toSignal<FirebaseUser | null>(user(this.auth), { initialValue: null });
  private _isLogged = signal<boolean>(false)
  
  public isLogged=this._isLogged.asReadonly()
  public currentUser: Signal<FirebaseUser | null> = this.firebaseUser;

  register(email:string,password:string):Observable<UserCredential>{
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(userCredential =>{
        localStorage.setItem('currentUser', JSON.stringify(userCredential.user))
        this._isLogged.set(true)
      })
    )
  }

  login(email:string,password:string):Observable<UserCredential>{
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(userCredential =>{
        localStorage.setItem('currentUser', JSON.stringify(userCredential.user))
        this._isLogged.set(true)
      })
    )
  }

  logout():Observable<void>{
    return from(signOut(this.auth)).pipe(
      tap(()=>{
        localStorage.removeItem('currentUser')
      })
    )
  }
}