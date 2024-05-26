import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [AuthService]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router : Router){};

  async login() {
    if(this.email && this.password){
      await this.authService.login(this.email,this.password);
      this.router.navigate(['']);
    }
  }

  async googleSignIn() {
    await this.authService.googleSignIn();
    this.router.navigate(['']);
  }
  
}
