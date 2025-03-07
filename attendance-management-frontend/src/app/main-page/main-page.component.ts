import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})
export class MainPageComponent implements OnInit {
  grades: any[] = [];
  professorId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.professorId = parseInt(localStorage.getItem('professorId') || '0', 10);
    if (this.professorId) {
      this.fetchGrades();
    } else {
      console.error('Professor ID not found');
    }
  }

  fetchGrades() {
    const url = `http://localhost:8080/professor/professor-grades/${this.professorId}`;
    this.http.get(url).subscribe({
      next: (data: any) => {
        this.grades = data;
      },
      error: (error) => {
        console.error('Error fetching grades', error);
      },
    });
  }

  viewStudents(gradeId: number) {
    const attendanceUrl = `http://localhost:8080/attendance/status?gradeId=${gradeId}&date=${this.selectedDate}`;

    this.http.get<boolean>(attendanceUrl).subscribe({
      next: (isSaved) => {
        if (isSaved) {
          this.router.navigate(['/students', gradeId], { queryParams: { disableButtons: true } });
        } else {
          this.router.navigate(['/students', gradeId]);
        }
      },
      error: (error) => {
        console.error('Error checking attendance status', error);
        alert('Failed to check attendance status. Redirecting anyway.');
        this.router.navigate(['/students', gradeId]);
      },
    });
  }
}
