import { Routes } from '@angular/router';
import { LoginComponent} from './login/login.component';
import { MainPageComponent} from './main-page/main-page.component';
import {StudentListComponent} from './student-list/student-list.component';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'main-page', component: MainPageComponent},
  { path: 'students/:id', component: StudentListComponent },
  {path: '**', redirectTo: '/login'}
];
