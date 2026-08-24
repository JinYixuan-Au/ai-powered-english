import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the opening welcome', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to');
    expect(compiled.querySelector('h1')?.textContent).toContain('Senior High School.');
    expect(compiled.textContent).toContain(
      "The High School Affiliated to Xi'an Jiaotong University",
    );
    const payoff = compiled.querySelector('.world-payoff');
    expect(payoff?.textContent).toContain('The world is');
    expect(payoff?.textContent).toContain('at your feet.');
  });

  it('should render the complete seven-section learning journey', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.shifts__header')?.textContent).toContain('What changes in');
    expect(compiled.querySelector('.shifts__header')?.textContent).toContain(
      'senior high English?',
    );
    expect(compiled.querySelector('.habits__header')?.textContent).toContain('So, how should');
    expect(compiled.querySelector('.habits__header')?.textContent).toContain('you learn?');
    expect(compiled.querySelector('.equation')?.textContent).toContain('Answer Machine');
    expect(compiled.querySelector('.equation')?.textContent).toContain('Learning Partner');
    expect(compiled.querySelector('.closing__content')?.textContent).toContain(
      'Three years from now',
    );
    expect(compiled.textContent).toContain('Welcome to Senior High English.');
  });

  it('should let the AI learning prototype respond to student reasoning', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const explainButton = compiled.querySelector<HTMLButtonElement>('.reason-button');

    expect(compiled.querySelector('.message--coach')?.textContent).toContain(
      'What evidence in the passage supports your choice?',
    );
    explainButton?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.message--coach')?.textContent).toContain(
      'connect that evidence to the writer’s purpose',
    );
  });
});
