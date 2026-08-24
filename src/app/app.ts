import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, inject } from '@angular/core';
import { WorldJourney } from './world-journey/world-journey';
import { LearningShifts } from './learning-shifts/learning-shifts';
import { LearningHabits } from './learning-habits/learning-habits';
import { AiJourney } from './ai-journey/ai-journey';
import { ClosingJourney } from './closing-journey/closing-journey';

@Component({
  imports: [WorldJourney, LearningShifts, LearningHabits, AiJourney, ClosingJourney],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  ngAfterViewInit(): void {
    const opening = this.elementRef.nativeElement.querySelector<HTMLElement>('.opening');
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!opening || reducedMotion) return;

    let frame = 0;
    const updateOpening = () => {
      frame = 0;
      const bounds = opening.getBoundingClientRect();
      const distance = Math.max(opening.offsetHeight - innerHeight, 1);
      const progress = Math.min(Math.max(-bounds.top / distance, 0), 1);
      opening.style.setProperty('--departure', progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateOpening);
    };

    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll, { passive: true });
      updateOpening();
    });

    this.destroyRef.onDestroy(() => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    });
  }
}
