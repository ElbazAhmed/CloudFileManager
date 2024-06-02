import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { async, filter, map, switchMap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserProfile } from '../../shared/user-profile.model';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,NgIf,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [AuthService]
})
export class HeaderComponent {
  uid: string | null = null; 
  profileUrl: string | undefined;
  defaultProfile = "https://firebasestorage.googleapis.com/v0/b/cloudfilemanager-fc984.appspot.com/o/profilePics%2FdefautPofile.jpeg?alt=media&token=b736edc6-9c19-495f-9c7d-1cdb6cbde1da";

  constructor(
    public authService: AuthService,
    private router: Router,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUserUid();
    this.getuserProfile();
  }

  getUserUid(): void {
    this.auth.user.pipe(
      filter(user => !!user), 
      map(user => user!.uid)  
    ).subscribe(uid => {
      this.uid = uid;
    });
  }

  getuserProfile(): void {
    this.auth.user.subscribe(user => {
      if (user) {
        this.firestore.collection<UserProfile>('users').doc(user.uid).valueChanges().subscribe(profile => {
          if (profile) {
            this.profileUrl = profile.profileUrl;
          }
        });
      }
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['']);
  }




}
