import { Component, computed, signal } from '@angular/core';
import { AiChat } from '../ai-chat/ai-chat';
import { BasicMarkdown } from '../shared/basic-markdown/basic-markdown';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

interface StartingPoint {
  strength: string;
  shift: string;
  habit: string;
  encouragement: string;
}

@Component({
  imports: [AiChat, BasicMarkdown, RevealOnScroll],
  selector: 'app-ai-journey',
  styleUrl: './ai-journey.scss',
  templateUrl: './ai-journey.html',
})
export class AiJourney {
  protected readonly strengthOptions = [
    'Vocabulary',
    'Grammar',
    'Reading',
    'Writing',
    'Listening',
    'Speaking',
    'Not sure yet',
  ];
  protected readonly challengeOptions = [
    'More vocabulary',
    'Longer reading passages',
    'Grammar',
    'Writing',
    'Speaking',
    'Keeping up with the class',
    'I’m not sure yet',
  ];
  protected readonly destinationOptions = [
    'Travel',
    'University',
    'Books & Films',
    'Technology & AI',
    'People & Cultures',
    'Understand the world',
    'Exams',
    'Something else',
  ];

  protected readonly step = signal(0);
  protected readonly strengths = signal<string[]>([]);
  protected readonly challenge = signal('');
  protected readonly challengeDetail = signal('');
  protected readonly destination = signal('');
  protected readonly destinationDetail = signal('');
  protected readonly result = signal<StartingPoint | null>(null);
  protected readonly error = signal('');
  protected readonly isLoading = signal(false);

  protected readonly canContinue = computed(() => {
    if (this.step() === 0) return this.strengths().length > 0;
    if (this.step() === 1) return Boolean(this.challenge() || this.challengeDetail().trim());
    return Boolean(this.destination() || this.destinationDetail().trim());
  });

  protected toggleStrength(option: string): void {
    this.error.set('');
    if (option === 'Not sure yet') {
      this.strengths.set(this.strengths().includes(option) ? [] : [option]);
      return;
    }
    const current = this.strengths().filter((item) => item !== 'Not sure yet');
    this.strengths.set(
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  protected selectChallenge(option: string): void {
    this.challenge.set(option);
    this.error.set('');
  }

  protected selectDestination(option: string): void {
    this.destination.set(option);
    this.error.set('');
  }

  protected updateChallengeDetail(event: Event): void {
    this.challengeDetail.set((event.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected updateDestinationDetail(event: Event): void {
    this.destinationDetail.set((event.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected nextStep(): void {
    if (!this.canContinue()) {
      this.error.set('Choose an answer before continuing.');
      return;
    }
    this.error.set('');
    this.step.update((step) => Math.min(step + 1, 2));
  }

  protected previousStep(): void {
    this.error.set('');
    this.step.update((step) => Math.max(step - 1, 0));
  }

  protected revisitAnswers(): void {
    this.result.set(null);
    this.step.set(0);
    this.error.set('');
  }

  protected async discoverStartingPoint(): Promise<void> {
    if (!this.strengths().length || !this.challengeAnswer() || !this.destinationAnswer()) {
      this.error.set('Please answer all three questions before continuing.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    try {
      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strengths: this.strengths(),
          concern: this.challengeAnswer(),
          goal: this.destinationAnswer(),
        }),
      });
      const responseBody = (await response.json()) as Partial<StartingPoint> & { error?: string };
      if (
        !response.ok ||
        !responseBody.strength ||
        !responseBody.shift ||
        !responseBody.habit ||
        !responseBody.encouragement
      ) {
        throw new Error('Invalid coaching response');
      }
      this.result.set(responseBody as StartingPoint);
    } catch {
      this.error.set('Your learning partner is taking a short break. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private challengeAnswer(): string {
    return [this.challenge(), this.challengeDetail().trim()].filter(Boolean).join(' — ');
  }

  private destinationAnswer(): string {
    return [this.destination(), this.destinationDetail().trim()].filter(Boolean).join(' — ');
  }
}
