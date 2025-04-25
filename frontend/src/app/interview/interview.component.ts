import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from './interview.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-interview',
  imports: [CommonModule, FormsModule],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css'],
})
export class InterviewComponent {
  resume = '';
  jobDescription = '';
  question = '';
  loading = false;
  resumeInputType: 'text' | 'file' = 'text';
  history: { role: 'user' | 'assistant'; content: string }[] = [];
  resumeReady = false;
  jobReady = false;
  uploadStatus = '';
  roundCount = 0;
  canRecord = false;
  interviewEnded = false;

  constructor(
    private interviewService: InterviewService,
    private cdr: ChangeDetectorRef
  ) {}

  recording = false;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];

  startRecording() {
    console.log('🎙️ Iniciando gravação...');
    this.recording = true;
    this.cdr.detectChanges();
    this.recordedChunks = [];
    this.canRecord = false;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      console.log('🔴 Gravação iniciada');

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
          console.log(`📦 Chunk gravado: ${e.data.size} bytes`);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('⏹️ Gravação parada, preparando envio para backend...');
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'response.wav');

        this.loading = true;

        this.interviewService.sendAnswer(formData).subscribe({
          next: (res) => {
            console.log('✅ Resposta da OpenAI recebida:', res);

            this.roundCount++;
            this.history.push({ role: 'user', content: res.transcript });
            this.history.push({ role: 'assistant', content: res.question });
            this.cdr.detectChanges();

            this.question = res.question;
            this.loading = false;

            const audioBlob = this.base64ToBlob(res.audio, 'audio/mpeg');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
              console.log('🔁 Áudio finalizado — liberando botão "Record Answer"');
              this.canRecord = true;
              this.cdr.detectChanges();
            };

            audio.onerror = () => {
              console.warn('⚠️ Falha ao tocar áudio — liberando gravação mesmo assim.');
              this.canRecord = true;
            };

            audio.play().then(() => {
              console.log('🔊 Áudio da pergunta tocando...');
            }).catch(err => {
              console.error('💥 Erro ao tocar áudio:', err);
              this.canRecord = true;
            });
          },
          error: (err) => {
            console.error('❌ Erro ao enviar áudio para a API:', err);
            this.loading = false;
          }
        });
      };
    }).catch(err => {
      console.error('🎙️ Erro ao acessar microfone:', err);
    });
  }

  stopRecording() {
    this.recording = false;
    this.loading = true;
    this.cdr.detectChanges();
    this.mediaRecorder.stop();
  }

  startInterview() {
    this.loading = true;
    this.history = [];
    this.roundCount = 1;

    this.interviewService.start(this.resume, this.jobDescription).subscribe({
      next: (res) => {
        this.loading = false;

        this.history.push({ role: 'assistant', content: res.question });

        const audioBlob = this.base64ToBlob(res.audio, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

        audio.onended = () => {
          this.canRecord = true;
        };
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  // Função utilitária
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);

      this.uploadStatus = '⏳ Extracting resume text...';
      this.loading = true;

      this.interviewService.uploadResume(formData).subscribe({
        next: (res) => {
          this.resume = res.text;
          this.resumeReady = true;
          this.uploadStatus = '✅ Resume ready!';
          this.loading = false;
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.uploadStatus = '❌ Failed to extract resume.';
          this.loading = false;
        }
      });
    } else {
      alert('Please upload a valid PDF.');
    }
  }

  confirmJobDescription() {
    if (this.jobDescription.trim().length > 0) {
      this.jobReady = true;
    } else {
      alert('Please paste the job description first.');
    }
  }

  exportTranscript() {
    let markdown = '# 🧠 Interview Transcript\n\n';

    this.history.forEach(entry => {
      const label = entry.role === 'user' ? '**👤 You:**' : '**🗨️ Interviewer:**';
      markdown += `${label} ${entry.content}\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'interview_transcript.md';
    link.click();

    // ✅ Pop-up de confirmação com reload
    setTimeout(() => {
      const restart = confirm("✅ Interview finished!\n\nYour transcript has been downloaded.\n\nDo you want to restart the interview?");
      if (restart) {
        window.location.reload();
      }
    }, 300); // pequeno delay para garantir que o download ocorra antes do reload
  }
}

