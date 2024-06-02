import { Component, OnInit } from '@angular/core';
import {  ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { finalize, map } from 'rxjs/operators';
import { switchMap, filter } from 'rxjs/operators';
import { FileUpload } from '../../models/file-upload.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroLink } from '@ng-icons/heroicons/outline';
import { BytesPipe } from '../../shared/bytes-pipe.pipe';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatProgressBarModule, NgIf, CommonModule, HeaderComponent, NgFor, NgIconComponent, BytesPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  viewProviders: [provideIcons({ heroLink })],
})


export class DashboardComponent implements OnInit{
  file: File | undefined;
  uploadProgress$!: Observable<number | undefined>;
  downloadURL$!: Observable<string | null>;
  userFiles$!: Observable<any[]>;
  totalSize$!: Observable<number>;
  totalSizePercentage$!: Observable<string>;
  private readonly MAX_STORAGE_SIZE = 1024 * 1024 * 1024; // 1 GB in bytes

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

  async addData(): Promise<void> {
    if (this.file) {
      const filePath = `uploads/${this.file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.file);
  
      // Track the upload progress
      this.uploadProgress$ = uploadTask.percentageChanges();
  
      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          try {
            const downloadURL = await fileRef.getDownloadURL().toPromise();
            this.downloadURL$ = new Observable<string | null>((observer) => {
              observer.next(downloadURL);
              observer.complete();
            });
  
            const user = await this.auth.currentUser;
            if (user) {
              const fileUpload = new FileUpload(this.file!.name, downloadURL, user.uid, this.file!.size);
  
              // Store file metadata in Firestore under 'uploads' collection
              await this.db.collection('uploads').add(Object.assign({}, fileUpload));
              console.log('File metadata saved to Firestore');
  
              // Refresh the list of user files
              this.getUserFiles();
            } else {
              console.error('No user is logged in');
            }
          } catch (error) {
            console.error('Error during file upload and metadata saving:', error);
          } finally {
            // Reset the file input after upload is completed
            this.file = undefined;
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
    this.userFiles$ = this.auth.user.pipe(
      filter(user => !!user), // Ensure user is not null
      switchMap(user => {
        console.log('Fetching files for user:', user?.uid);
        return this.db.collection('uploads', ref => ref.where('uid', '==', user!.uid)).valueChanges();
      })
    );
    this.totalSize$ = this.userFiles$.pipe(
      map(files => files.reduce((total, file) => total + file.size, 0))
    );
    this.calculateTotalSizePercentage();

  
    this.userFiles$.subscribe(files => {
      console.log('User files:', files);
      if (files.length === 0) {
        console.warn('No files found for the user.');
      }
    }, error => {
      console.error('Error fetching user files:', error);
    });
  }

  deleteFile(file: FileUpload): void {
    const confirmDelete = window.confirm(`Are you sure you want to delete this file: ${file.name}`);
    if (!confirmDelete) {
      return;
    }

    const fileRef = this.storage.ref(`uploads/${file.name}`);
    fileRef.delete().subscribe(() => {
      console.log('File deleted successfully from storage');
      this.db.collection<FileUpload>('uploads', ref => ref.where('name', '==', file.name)).get().toPromise().then(querySnapshot => {
        querySnapshot!.forEach(doc => {
          doc.ref.delete().then(() => {
            console.log('File metadata deleted from Firestore');
            // Refresh the list of user files
            this.getUserFiles();
          }).catch(error => {
            console.error('Error deleting file metadata from Firestore', error);
          });
        });
      }).catch(error => {
        console.error('Error getting file metadata from Firestore', error);
      });
    }, error => {
      console.error('Error deleting file from storage', error);
    });
}

  copyLink(link: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = link;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link copied to clipboard!');
  }

  calculateTotalSizePercentage(): Observable<string> {
    return this.totalSize$.pipe(
      map(totalSize => {
        const percentage = (totalSize / this.MAX_STORAGE_SIZE) * 100;
        return `${percentage.toFixed(2)}%`;
      })
    );
  }
}


