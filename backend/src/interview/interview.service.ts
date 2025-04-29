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
    // 🔥 Função para limitar o histórico a no máximo 20 mensagens (exclui a system message)
    private truncateHistory(maxMessages = 20): void {
      if (this.chatHistory.length > maxMessages) {
        this.chatHistory = this.chatHistory.slice(-maxMessages);
      }
    }


  constructor() {
    this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });      
  }

  async generateFirstQuestion(resume: string, jobDescription: string): Promise<string> {
    const prompt = `
      You are a professional English-speaking job interviewer conducting a realistic and structured job interview.

      You must:
      - Evaluate the candidate's technical background and problem-solving abilities.
      - Assess behavioral and cultural fit through classic interview questions.
      - Ensure that during the conversation, you ask **at least once** the following classic questions:
        - Tell me about yourself.
        - What do you know about our company?
        - Why do you want this job?
        - Why should we hire you?
        - What are your strengths and weaknesses?
        - What makes a great [insert job title]?
        - What would excellent performance look like?

      Important rules:
      - Alternate between technical questions and behavioral questions.
      - Always ask only one question at a time.
      - Be professional, natural, and realistic.
      - Do not write answers; ask only the questions.
      - Continue the interview based on the user's previous answers, but do not stay only in technical discussions; remember to insert behavioral questions along the way.

      Resume:
      ${resume}

      Job Description:
      ${jobDescription}

      Now, please ask the first interview question. Please stand for not only technical discussions.
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
    this.truncateHistory();

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
    this.truncateHistory();

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
    this.truncateHistory();

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
    this.truncateHistory();
  
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
