import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { BasicMarkdown } from '../shared/basic-markdown/basic-markdown';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  imports: [BasicMarkdown, RevealOnScroll],
  selector: 'app-ai-chat',
  styleUrl: './ai-chat.scss',
  templateUrl: './ai-chat.html',
})
export class AiChat {
  protected readonly suggestions = [
    'Explain this sentence',
    'Why is this answer wrong?',
    'Help me improve my writing',
    'Teach me this word in context',
    'Give me a reading strategy',
    'How should I study English in senior high?',
  ];

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly draft = signal('');
  protected readonly isLoading = signal(false);
  protected readonly error = signal('');

  private readonly historyElement = viewChild<ElementRef<HTMLDivElement>>('chatHistory');
  private activeRequest?: AbortController;

  protected updateDraft(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
    this.error.set('');
  }

  protected useSuggestion(suggestion: string): void {
    if (!this.isLoading()) void this.sendMessage(suggestion);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage();
    }
  }

  protected backToChoices(): void {
    this.activeRequest?.abort();
    this.activeRequest = undefined;
    this.messages.set([]);
    this.draft.set('');
    this.isLoading.set(false);
    this.error.set('');
  }

  protected async sendMessage(suggestion?: string): Promise<void> {
    const content = (suggestion ?? this.draft()).trim();
    if (!content || this.isLoading()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const previousMessages = this.messages();
    const conversation = [...previousMessages, userMessage];
    this.messages.set(conversation);
    this.draft.set('');
    this.error.set('');
    this.isLoading.set(true);
    this.scrollToLatest();
    const requestController = new AbortController();
    this.activeRequest = requestController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation.slice(-10) }),
        signal: requestController.signal,
      });
      const responseBody = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !responseBody.message?.trim()) {
        throw new Error('Invalid chat response');
      }
      this.messages.update((messages) => [
        ...messages,
        { role: 'assistant', content: responseBody.message!.trim() },
      ]);
    } catch {
      if (requestController.signal.aborted) return;
      this.messages.set(previousMessages);
      this.draft.set(content);
      this.error.set('Your learning partner is taking a short break. Please try again.');
    } finally {
      if (this.activeRequest === requestController) {
        this.activeRequest = undefined;
        this.isLoading.set(false);
        this.scrollToLatest();
      }
    }
  }

  private scrollToLatest(): void {
    setTimeout(() => {
      const element = this.historyElement()?.nativeElement;
      if (element) element.scrollTop = element.scrollHeight;
    });
  }
}
