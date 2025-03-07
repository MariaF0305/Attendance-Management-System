import { Component } from '@angular/core';
import {AuthService} from '../auth.service';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;

  constructor(private  http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post('http://localhost:8080/professor/login', { email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          localStorage.setItem('professorId', response.id);
          this.router.navigate(['/main-page']);
        },
        error: (error) => {
          console.error('Error during login', error);
          this.error = 'Invalid credentials. Please try again.';
        }
      });
  }
}
