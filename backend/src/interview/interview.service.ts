import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import * as crypto from 'crypto';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class InterviewService {
    private chatHistory: ChatCompletionMessageParam[] = [];
    private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });      
  }

  async generateFirstQuestion(resume: string, jobDescription: string): Promise<string> {
    const prompt = `
You are a professional English-speaking job interviewer.

Based on the candidate's resume and the job description below, ask the FIRST interview question only.

Be realistic and focus on the candidate's fit for the job.

Do not write the answer, only ask the question.

Resume:
${resume}

Job Description:
${jobDescription}

Now, ask your first interview question.
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content ?? '';
  }

  async transcribeAudio(buffer: Buffer): Promise<string> {
    const tempName = crypto.randomUUID() + '.wav';
    const tempPath = path.join(tmpdir(), tempName);
  
    // Salva arquivo temporariamente
    fs.writeFileSync(tempPath, buffer);
  
    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-1',
      response_format: 'text'
    });
  
    fs.unlinkSync(tempPath);
  
    return transcription as string;
  }  
  
  async generateNextQuestion(userResponse: string): Promise<{ question: string; audio: Buffer }> {
    this.chatHistory.push({ role: 'user', content: userResponse });

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional English-speaking job interviewer.' },
        ...this.chatHistory
      ],
      temperature: 0.7
    });

    const question = completion.choices[0].message.content ?? '';
    this.chatHistory.push({ role: 'assistant', content: question });

    const audio = await this.speakText(question);
    return { question, audio };
  }

  async speakText(text: string): Promise<Buffer> {
    const response = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text
    });

    return Buffer.from(await response.arrayBuffer());
  }

  async answerInterview(userAnswer: string): Promise<{ nextQuestion: string; audio: Buffer; transcript: string }> {
    this.chatHistory.push({ role: 'user', content: userAnswer });
  
    const systemPrompt: ChatCompletionMessageParam = {
        role: 'system',
        content: `You are conducting a job interview in English. After each user answer, always ask a follow-up question. Do not say things like "thank you" or "goodbye". The interview is not over until the user ends it manually.`
    };      
      
    const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [systemPrompt, ...this.chatHistory],
        temperature: 0.7,
      });          
  
    const nextQuestion = response.choices[0].message.content ?? '';
  
    this.chatHistory.push({
      role: 'assistant',
      content: nextQuestion
    });
  
    const audio = await this.speakText(nextQuestion);
  
    return {
      nextQuestion,
      audio,
      transcript: userAnswer
    };
  }  

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }
 
  endInterview() {
    const markdownTranscript = this.chatHistory
      .map((entry) => {
        const label = entry.role === 'user' ? '👤 You' : entry.role === 'assistant' ? '🗨️ Interviewer' : '📘 System';
        return `**${label}:** ${entry.content}`;
      })
      .join('\n\n');

    return {
      message: 'Interview ended.',
      transcript: markdownTranscript,
    };
  }
}
