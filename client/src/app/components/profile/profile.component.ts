import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UserProfile } from '@angular/fire/auth';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, NgIf],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  uid: string | null = null;
  profileForm: FormGroup;
  selectedFile: File | null = null;
  defaultProfile = "https://firebasestorage.googleapis.com/v0/b/cloudfilemanager-fc984.appspot.com/o/profilePics%2FdefautPofile.jpeg?alt=media&token=b736edc6-9c19-495f-9c7d-1cdb6cbde1da";
  downloadURL: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      firstName: [''],
      lastName: [''],
      phoneNumber: [''],
      profileUrl: [''],
      uid: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.auth.user.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          email: user.email,
          uid: user.uid
        });
        this.firestore.collection<UserProfile>('users').doc(user.uid).valueChanges().subscribe(profile => {
          if (profile) {
            this.profileForm.patchValue({
              firstName: profile['firstName'] || '',
              lastName: profile['lastName'] || '',
              phoneNumber: profile['phoneNumber'] || '',
              profileUrl: profile['profileUrl'] || ''
            });
          }
        });
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const filePath = `profilePics/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          this.profileForm.patchValue({ profileUrl: downloadURL });
        })
      ).subscribe();
    }
  }

  onSubmit(): void {
    const profileData: UserProfile = this.profileForm.getRawValue();
    this.auth.user.subscribe(user => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).set(profileData, { merge: true });
      }
    });
  }
}

