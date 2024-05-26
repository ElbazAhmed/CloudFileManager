import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers : [AuthService]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    if (this.email && this.password && this.username) {
      await this.authService.register(this.email, this.password, this.username);
      this.router.navigate(['/login']);
    }
  }

  async googleSignIn() {
      await this.authService.googleSignIn();
      this.router.navigate(['']);
  }
}
