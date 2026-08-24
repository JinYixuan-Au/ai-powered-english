import { Component } from '@angular/core';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

@Component({
  imports: [RevealOnScroll],
  selector: 'app-closing-journey',
  styleUrl: './closing-journey.scss',
  templateUrl: './closing-journey.html',
})
export class ClosingJourney {}
