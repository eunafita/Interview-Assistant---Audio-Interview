import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('start')
  async startInterview(@Body() body: { resume: string; jobDescription: string }) {
    const { resume, jobDescription } = body;
    const question = await this.interviewService.generateFirstQuestion(resume, jobDescription);
    const audioBuffer = await this.interviewService.speakText(question);

    const audioBase64 = audioBuffer.toString('base64');
    return {
      question,
      audio: audioBase64,
    };
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('answer')
  async answer(@UploadedFile() file: Express.Multer.File) {
    const transcript = await this.interviewService.transcribeAudio(file.buffer);
    const result = await this.interviewService.answerInterview(transcript);

    return {
      transcript,
      question: result.nextQuestion,
      audio: result.audio.toString('base64'),
    };
  }

  @Post('end')
  endInterview() {
    return this.interviewService.endInterview();
  }

  @Post('upload-resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    const text = await this.interviewService.extractTextFromPdf(file.buffer);
    return { text };
  }
}
