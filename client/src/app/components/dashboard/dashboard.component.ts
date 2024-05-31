import { Component } from '@angular/core';
import {  ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatProgressBarModule, NgIf, CommonModule, HeaderComponent, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  file: File | null = null;
  uploadProgress$!: Observable<number | undefined>;
  downloadURL$!: Observable<string | null>;
  userFiles$!: Observable<any[]>;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.getUserFiles();
  }

  chooseFile(event: any): void {
    this.file = event.target.files[0];
  }

  addData(): void {
    if (this.file) {
      const filePath = `uploads/${this.file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.file);
  
      // Track the upload progress
      this.uploadProgress$ = uploadTask.percentageChanges();
  
      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          this.downloadURL$ = fileRef.getDownloadURL();
  
          const user = await this.auth.currentUser;
          if (user) {
            const fileMetadata = {
              name: this.file?.name,
              url: downloadURL,
              uid: user.uid,
              uploadedAt: new Date()
            };
  
            // Store file metadata in Firestore under 'uploads' collection
            this.db.collection('uploads').add(fileMetadata).then(() => {
              console.log('File metadata saved to Firestore');
            }).catch(error => {
              console.error('Error saving file metadata to Firestore', error);
            });
          }
        })
      ).subscribe({
        next: (snapshot) => {
          // Optional: track upload progress
          console.log('Upload in progress...', snapshot);
        },
        error: (error) => {
          console.error('Upload failed', error);
        },
        complete: () => {
          console.log('Upload completed');
        }
      });
    } else {
      console.log('No file selected');
    }
  }
  

  getUserFiles(): void {
    this.auth.user.subscribe(user => {
      if (user) {
        this.userFiles$ = this.db.collection('uploads', ref => ref.where('uid', '==', user.uid)).valueChanges();
      }
      console.log(user?.uid);
    });
  }
}


