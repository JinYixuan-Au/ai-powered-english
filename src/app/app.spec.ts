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
    expect(compiled.textContent).toContain("The High School Affiliated to Xi'an Jiaotong University");
    const payoff = compiled.querySelector('.world-payoff');
    expect(payoff?.textContent).toContain('The world is');
    expect(payoff?.textContent).toContain('at your feet.');
  });
});
