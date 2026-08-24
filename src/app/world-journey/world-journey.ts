import { AfterViewInit, Component, DestroyRef, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-world-journey',
  styleUrl: './world-journey.scss',
  templateUrl: './world-journey.html',
})
export class WorldJourney implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    const root = this.elementRef.nativeElement;
    const revealItems = root.querySelectorAll<HTMLElement>('[data-reveal]');

    const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.18 },
    );

    revealItems.forEach((item) => observer.observe(item));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
