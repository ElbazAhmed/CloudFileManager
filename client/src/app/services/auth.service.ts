import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn : Observable<boolean>;

  constructor(private afAuth: AngularFireAuth) {
    this.isLoggedIn = this.afAuth.authState.pipe(map(user => !!user));
  }
  
  

  async register(email: string, password: string, username: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: username,
        });
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }

  async googleSignIn(): Promise<void> {
    try {
      await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  }

  async login(email: string, password: string){
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  async logout(){
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.error('Error during log out:', error);
    }
  }

}