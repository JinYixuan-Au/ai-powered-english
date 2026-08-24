import { Component } from '@angular/core';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

@Component({
  imports: [RevealOnScroll],
  selector: 'app-learning-shifts',
  styleUrl: './learning-shifts.scss',
  templateUrl: './learning-shifts.html',
})
export class LearningShifts {}
