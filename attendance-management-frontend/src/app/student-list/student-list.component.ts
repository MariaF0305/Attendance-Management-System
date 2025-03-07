import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent {
  students: any[] = [];
  gradeId: number | null = null;
  gradeName: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];
  attendanceSaved = false;
  displayedColumns: string[] = ['studentId', 'studentName'];

  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit() {
    this.gradeId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    if (this.gradeId) {
      this.checkAttendanceStatus();
      this.fetchStudents();
      this.fetchGradeName();
    } else {
      console.error('Grade ID not found');
    }
  }

  fetchGradeName() {
    const url = `http://localhost:8080/grade/find/${this.gradeId}`;
    this.http.get<{ gradeId: number, gradeName: string }>(url).subscribe({
      next: (grade) => {
        this.gradeName = grade.gradeName;
      },
      error: (error) => {
        console.error('Error fetching grade name', error);
        this.gradeName = 'Unknown Grade';
      },
    });
  }

  isSaveDisabled(): boolean {
    return this.students.every(student => student.disabled);
  }

  fetchStudents() {
    const url = `http://localhost:8080/student/grades/${this.gradeId} `.trim();
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.students = data.map((student) => ({
          ...student,
          present: false,
          disabled: student.attendanceMarkedForDate,
        }));
        this.updateDisplayedColumns();
      },
      error: (error) => {
        console.error('Error fetching students', error);
      },
    });
  }

  saveAttendance() {
    const attendanceRecords = this.students.map((student) => ({
      student: { studentId: student.studentId } ,
      date: this.selectedDate,
      status: student.present,
    }));

    const url = 'http://localhost:8080/attendance/save';
    this.http.post(url, attendanceRecords).subscribe({
      next: () => {
        alert('Attendance saved successfully');
        this.attendanceSaved = true;
        this.fetchStudents();
      },
      error: (error) => {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance. Please try again.');
      },
    });
  }

  generateReport() {
    const reportData = this.students.map((student) => ({
      name: student.studentName,
      nrAttendance: student.nrAttendance || 0,
    }));
    const csvContent = this.convertToCSV(reportData);
    this.downloadCSV(csvContent, `attendance_report_${this.gradeId}.csv`);
  }

  private convertToCSV(data: any[]): string {
    const headers = ['Name', 'Total Attendance'];
    const rows = data.map((d) => `${d.name}, ${d.nrAttendance || 0}`);
    return [headers.join(','), ...rows].join('\n');
  }

  private downloadCSV(content: string, fileName: string) {
    try {
      const blob = new Blob([content], { type: 'text/csv' });
      const csvURL = (window as any).URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = csvURL;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      (window as any).URL.revokeObjectURL(csvURL);
    } catch (error) {
      console.error('Error generating or downloading CSV:', error);
    }
  }

  checkAttendanceStatus() {
    const url = `http://localhost:8080/attendance/status?gradeId=${this.gradeId}&date=${this.selectedDate}`;
    this.http.get<boolean>(url).subscribe({
      next: (isSaved) => {
        this.attendanceSaved = isSaved;
        this.updateDisplayedColumns();
      },
      error: (error) => {
        console.error('Error checking attendance status:', error);
      },
    });
  }

  updateDisplayedColumns() {
    if (!this.attendanceSaved) {
      this.displayedColumns = ['number', 'studentId', 'studentName', 'present'];
    } else {
      this.displayedColumns = ['number', 'studentId', 'studentName'];
    }
  }
}
