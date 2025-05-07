import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  private API_URL = 'http://localhost:3000/interview';

  constructor(private http: HttpClient) {}

  start(resume: string, jobDescription: string) {
    return this.http.post<{ question: string; audio: string }>(`${this.API_URL}/start`, {
      resume,
      jobDescription,
    });
  }

  uploadResume(formData: FormData) {
    return this.http.post<{ text: string }>(`${this.API_URL}/upload-resume`, formData);
  }

  sendAnswer(formData: FormData) {
    return this.http.post<{ question: string; audio: string; transcript: string }>(
      `${this.API_URL}/answer`,
      formData,
    );
  }
}
