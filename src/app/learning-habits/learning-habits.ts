import { Component } from '@angular/core';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

@Component({
  imports: [RevealOnScroll],
  selector: 'app-learning-habits',
  styleUrl: './learning-habits.scss',
  templateUrl: './learning-habits.html',
})
export class LearningHabits {}
