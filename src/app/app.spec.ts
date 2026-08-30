import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
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

  it("should center Xi'an as the origin of every world-map route", async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const map = compiled.querySelector<SVGElement>('.world-map');
    const homePoint = compiled.querySelector<SVGCircleElement>('.location--home .location__point');
    const zhangyePoint = compiled.querySelector<SVGCircleElement>('.location--4 .location__point');
    const melbournePoint = compiled.querySelector<SVGCircleElement>(
      '.location--7 .location__point',
    );
    const routes = [...compiled.querySelectorAll<SVGPathElement>('.routes path')];

    expect(map?.getAttribute('viewBox')).toBe('400 0 1200 620');
    expect(homePoint?.getAttribute('cx')).toBe('1000');
    expect(zhangyePoint?.getAttribute('cx')).toBe('960');
    expect(zhangyePoint?.getAttribute('cy')).toBe('260');
    expect(melbournePoint?.getAttribute('cx')).toBe('1100');
    expect(melbournePoint?.getAttribute('cy')).toBe('475');
    expect(compiled.querySelectorAll('.continents path')).toHaveLength(5);
    expect(routes).toHaveLength(7);
    expect(routes.every((route) => route.getAttribute('d')?.startsWith('M1000 300'))).toBe(true);
    expect(map?.textContent).toContain('LONDON');
    expect(map?.textContent).toContain('PARIS');
    expect(map?.textContent).toContain('TORONTO');
    expect(map?.textContent).toContain('SAN FRANCISCO');
    expect(map?.textContent).toContain('MACHU PICCHU');
  });

  it('should complete the starter coach and request structured AI feedback', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          strength: '**Vocabulary** gives you a useful foundation.',
          shift: 'Move from remembering meanings to noticing how words work in context.',
          habit: 'Save one complete sentence each time you learn a new word.',
          encouragement: 'This is a strong place to begin.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.strength-option')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.step-next')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.challenge-option')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.step-next')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.destination-option')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.discover-button')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai-feedback',
      expect.objectContaining({ method: 'POST' }),
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({
      strengths: ['Vocabulary'],
      concern: 'More vocabulary',
      goal: 'Travel',
    });
    expect(compiled.querySelector('.starting-point')?.textContent).toContain(
      'Move from remembering meanings to noticing how words work in context.',
    );
    expect(compiled.querySelector('.starting-point app-basic-markdown strong')?.textContent).toBe(
      'Vocabulary',
    );
    expect(compiled.querySelector('.starting-point')?.textContent).not.toContain('**');
    vi.unstubAllGlobals();
  });

  it('should require an answer before progressing through the starter coach', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector<HTMLButtonElement>('.step-next')?.disabled).toBe(true);
    expect(compiled.querySelector('.starter-question__label')?.textContent).toContain(
      'Your strength',
    );
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('should keep context across three chatbot turns', async () => {
    const replies = [
      'Historic describes something important in history; historical describes something related to history. <img src=x onerror=alert(1)>',
      '1. **READ** – Read the text carefully.\n\n2. **NOTICE** – After reading, pause and ask:\n\n   - What is the author’s purpose?\n   - What key details support the main idea?\n   - What words or phrases stand out?\n\n3. **USE** – Use what you noticed.\n\n4. **REFLECT** – Think about what worked.',
      '**READ**\n- First point\n- Second point\n\n💡 *Example:* Notice how the writer uses strong words.\n\n👉 *Thinking question:* What detail supports the author’s tone?',
    ];
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ message: replies[fetchMock.mock.calls.length - 1] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const ask = async (question: string) => {
      const textarea = compiled.querySelector<HTMLTextAreaElement>('#chat-question');
      if (!textarea) throw new Error('Chat input was not rendered');
      textarea.value = question;
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      compiled.querySelector<HTMLButtonElement>('.chat__send')?.click();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    await ask("What is the difference between 'historic' and 'historical'?");
    await ask('Can you give me an example?');
    await ask('Can I try one?');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/chat',
      expect.objectContaining({ method: 'POST' }),
    );
    const lastRequest = fetchMock.mock.calls[2][1] as RequestInit;
    const lastBody = JSON.parse(lastRequest.body as string);
    expect(lastBody.messages).toHaveLength(5);
    expect(lastBody.messages.map((message: { role: string }) => message.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
      'user',
    ]);
    const formattedResponses = [
      ...compiled.querySelectorAll<HTMLElement>(
        '.chat-message:not(.chat-message--user) app-basic-markdown',
      ),
    ];
    expect(formattedResponses[0].querySelector('img')).toBeNull();
    const orderedList = formattedResponses[1].querySelector('ol');
    const nestedList = orderedList?.children.item(1)?.querySelector('ul');
    expect(formattedResponses[1].querySelectorAll('ol')).toHaveLength(1);
    expect(orderedList?.children).toHaveLength(4);
    expect(nestedList?.children).toHaveLength(3);
    expect(orderedList?.children.item(0)?.querySelector('strong')?.textContent).toBe('READ');
    expect(orderedList?.children.item(1)?.querySelector('strong')?.textContent).toBe('NOTICE');
    expect(orderedList?.children.item(2)?.querySelector('strong')?.textContent).toBe('USE');
    expect(orderedList?.children.item(3)?.querySelector('strong')?.textContent).toBe('REFLECT');
    expect(formattedResponses[2].querySelector('strong')?.textContent).toBe('READ');
    expect(formattedResponses[2].querySelectorAll('ul li')).toHaveLength(2);
    expect(
      [...formattedResponses[2].querySelectorAll('em')].map((item) => item.textContent),
    ).toEqual(['Example:', 'Thinking question:']);
    expect(formattedResponses[2].textContent).not.toContain('*');
    expect(compiled.querySelector('#lab-title')?.textContent).toContain('Meet your');
    vi.unstubAllGlobals();
  });

  it('should return to chatbot choices and start a fresh conversation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Let’s explore that together.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const suggestions = () =>
      compiled.querySelectorAll<HTMLButtonElement>('.chat__suggestions button');
    suggestions()[0].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.chat__history')?.textContent).toContain(
      'Explain this sentence',
    );
    compiled.querySelector<HTMLButtonElement>('.chat__back')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.chat__history')).toBeNull();
    expect(compiled.querySelector<HTMLTextAreaElement>('#chat-question')?.value).toBe('');
    expect(suggestions()).toHaveLength(6);

    suggestions()[1].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondRequest = fetchMock.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(secondRequest.body as string).messages).toEqual([
      { role: 'user', content: 'Why is this answer wrong?' },
    ]);
    expect(compiled.querySelector('#lab-title')?.textContent).toContain('Meet your');
    vi.unstubAllGlobals();
  });
});
