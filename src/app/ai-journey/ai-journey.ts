import { Component, signal } from '@angular/core';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

@Component({
  imports: [RevealOnScroll],
  selector: 'app-ai-journey',
  styleUrl: './ai-journey.scss',
  templateUrl: './ai-journey.html',
})
export class AiJourney {
  protected readonly selectedAnswer = signal('B');
  protected readonly hasExplained = signal(false);
}
