import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) {}

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

}