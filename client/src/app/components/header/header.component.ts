import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,NgIf,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [AuthService]
})
export class HeaderComponent {
  constructor(public authService: AuthService){};

  async logout() {
    await this.authService.logout();
    window.location.reload();
  }

}
