import { Component } from '@angular/core';
import { InterviewComponent } from './interview/interview.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [InterviewComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
}
