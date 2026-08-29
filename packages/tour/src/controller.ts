import { trackTourEvent } from './analytics';
import {
  CAMP_TOUR_STEPS,
  TOUR_COPY,
  tourLocale,
  type GuidedTourStep,
  type TourLocale,
} from './definition';
import { initialTourState, normalizeTourState, transitionTour, type TourState } from './state';
import { TOUR_STYLES } from './styles';

const STORAGE_KEY = 'logic2b:camp-tour:v1';
const ROOT_ID = 'lc-tour-root';
const STYLE_ID = 'lc-tour-styles';
let initialized = false;
let lastTrigger: HTMLElement | null = null;

function readState(): TourState {
  try {
    return normalizeTourState(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null'), CAMP_TOUR_STEPS.length);
  } catch {
    return initialTourState;
  }
}

function saveState(state: TourState): void {
  try {
    if (state.status === 'idle' || state.status === 'complete') sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // La guía sigue funcionando en memoria aunque el navegador no permita persistir la pestaña.
  }
}

function value(text: Record<TourLocale, string>, locale: TourLocale): string {
  return text[locale];
}

function installStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = TOUR_STYLES;
  document.head.append(style);
}

function root(): HTMLElement {
  document.getElementById(ROOT_ID)?.remove();
  const element = document.createElement('div');
  element.id = ROOT_ID;
  element.className = 'lc-tour-root';
  document.body.append(element);
  return element;
}

function setTriggerLabels(state: TourState, locale: TourLocale): void {
  const copy = TOUR_COPY[locale];
  document.querySelectorAll<HTMLElement>('[data-camp-tour-trigger]').forEach((trigger) => {
    const label = trigger.querySelector<HTMLElement>('[data-camp-tour-label]');
    if (label) label.textContent = state.status === 'paused' ? copy.resume : copy.trigger;
    trigger.setAttribute('aria-label', state.status === 'paused' ? copy.resume : copy.trigger);
  });
}

function stepDestination(step: GuidedTourStep, locale: TourLocale): string {
  return value(step.route, locale);
}

function revealTarget(step: GuidedTourStep): void {
  window.setTimeout(() => {
    const target = document.querySelector<HTMLElement>(step.target);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function navigateTo(step: GuidedTourStep, locale: TourLocale): boolean {
  const target = new URL(stepDestination(step, locale), location.origin);
  const current = new URL(location.href);
  if (
    target.pathname === current.pathname &&
    target.search === current.search &&
    target.hash === current.hash
  ) {
    revealTarget(step);
    return false;
  }
  location.assign(`${target.pathname}${target.search}${target.hash}`);
  return true;
}

function focusFirst(container: HTMLElement): void {
  window.setTimeout(() => {
    container.querySelector<HTMLElement>('button, [href], [tabindex="0"]')?.focus();
  });
}

function trapDialog(dialog: HTMLElement, onEscape: () => void): () => void {
  const handler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]')];
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

function listenForEscape(onEscape: () => void): () => void {
  const handler = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    onEscape();
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

function init(): void {
  if (initialized) return;
  initialized = true;
  installStyles();
  const locale = tourLocale(document.documentElement.lang);
  let state = readState();
  let removeKeyboardHandler: (() => void) | undefined;

  const setState = (next: TourState) => {
    state = next;
    saveState(state);
    setTriggerLabels(state, locale);
  };

  const clearRoot = () => {
    removeKeyboardHandler?.();
    removeKeyboardHandler = undefined;
    document.getElementById(ROOT_ID)?.remove();
  };

  const exit = (track = true) => {
    if (track) trackTourEvent('tour_exit', state.stepIndex);
    setState(transitionTour(state, { type: 'exit' }, CAMP_TOUR_STEPS.length));
    clearRoot();
    lastTrigger?.focus();
  };

  const renderResume = () => {
    clearRoot();
    const container = root();
    container.innerHTML = `<button type="button" class="lc-tour-resume" data-tour-resume>${TOUR_COPY[locale].resume}</button>`;
    const resume = container.querySelector<HTMLButtonElement>('[data-tour-resume]')!;
    resume.addEventListener('click', () => {
      trackTourEvent('tour_resume', state.stepIndex);
      setState(transitionTour(state, { type: 'resume' }, CAMP_TOUR_STEPS.length));
      const changed = navigateTo(CAMP_TOUR_STEPS[state.stepIndex]!, locale);
      if (!changed) renderCard();
    });
    focusFirst(container);
  };

  const renderCard = () => {
    clearRoot();
    const step = CAMP_TOUR_STEPS[state.stepIndex]!;
    const copy = TOUR_COPY[locale];
    const isLast = state.stepIndex === CAMP_TOUR_STEPS.length - 1;
    const segments = CAMP_TOUR_STEPS.map(
      (_, index) => `<span class="lc-tour-segment${index <= state.stepIndex ? ' is-done' : ''}"></span>`,
    ).join('');
    const container = root();
    container.innerHTML = `
      <aside class="lc-tour-card" role="region" aria-labelledby="lc-tour-step-title" tabindex="-1">
        <div class="lc-tour-segments" role="progressbar" aria-label="${copy.progress}" aria-valuemin="1" aria-valuemax="${CAMP_TOUR_STEPS.length}" aria-valuenow="${state.stepIndex + 1}" aria-valuetext="${copy.step} ${state.stepIndex + 1} de ${CAMP_TOUR_STEPS.length}">${segments}</div>
        <button type="button" class="lc-tour-close" data-tour-exit aria-label="${copy.close}">×</button>
        <p class="lc-tour-step">${copy.step} ${state.stepIndex + 1}/${CAMP_TOUR_STEPS.length} · ${value(step.phase, locale)}</p>
        <h2 id="lc-tour-step-title">${value(step.title, locale)}</h2>
        <p class="lc-tour-description">${value(step.description, locale)}</p>
        <p class="lc-tour-evidence"><strong>${copy.visibleEvidence}</strong>${value(step.evidence, locale)}</p>
        <div class="lc-tour-actions">
          <button type="button" class="lc-tour-button" data-tour-pause>${copy.pause}</button>
          ${
            isLast
              ? `<button type="button" class="lc-tour-button" data-tour-complete>${copy.continue}</button><button type="button" class="lc-tour-button lc-tour-button--primary" data-tour-cta>${value(step.finalCta!.label, locale)}</button>`
              : `<button type="button" class="lc-tour-button lc-tour-button--primary" data-tour-next>${copy.next} →</button>`
          }
        </div>
      </aside>`;
    const card = container.querySelector<HTMLElement>('.lc-tour-card')!;
    container.querySelector('[data-tour-exit]')?.addEventListener('click', () => exit());
    container.querySelector('[data-tour-pause]')?.addEventListener('click', () => {
      trackTourEvent('tour_pause', state.stepIndex);
      setState(transitionTour(state, { type: 'pause' }, CAMP_TOUR_STEPS.length));
      renderResume();
    });
    container.querySelector('[data-tour-next]')?.addEventListener('click', () => {
      trackTourEvent('tour_step_complete', state.stepIndex);
      setState(transitionTour(state, { type: 'next' }, CAMP_TOUR_STEPS.length));
      const changed = navigateTo(CAMP_TOUR_STEPS[state.stepIndex]!, locale);
      if (!changed) renderCard();
    });
    container.querySelector('[data-tour-complete]')?.addEventListener('click', () => {
      trackTourEvent('tour_step_complete', state.stepIndex);
      trackTourEvent('tour_complete', state.stepIndex);
      setState(transitionTour(state, { type: 'complete' }, CAMP_TOUR_STEPS.length));
      clearRoot();
    });
    container.querySelector('[data-tour-cta]')?.addEventListener('click', () => {
      trackTourEvent('tour_step_complete', state.stepIndex);
      trackTourEvent('tour_cta', state.stepIndex);
      trackTourEvent('tour_complete', state.stepIndex);
      setState(transitionTour(state, { type: 'complete' }, CAMP_TOUR_STEPS.length));
      location.assign(value(step.finalCta!.route, locale));
    });
    removeKeyboardHandler = listenForEscape(() => {
      trackTourEvent('tour_pause', state.stepIndex);
      setState(transitionTour(state, { type: 'pause' }, CAMP_TOUR_STEPS.length));
      renderResume();
    });
    revealTarget(step);
    window.setTimeout(() => card.focus(), 120);
  };

  const renderIntro = () => {
    clearRoot();
    const copy = TOUR_COPY[locale];
    const container = root();
    container.innerHTML = `
      <div class="lc-tour-overlay">
        <section class="lc-tour-intro" role="dialog" aria-modal="true" aria-label="${copy.dialogLabel}" aria-labelledby="lc-tour-intro-title">
          <button type="button" class="lc-tour-close" data-tour-free aria-label="${copy.close}">×</button>
          <p class="lc-tour-eyebrow">${copy.eyebrow}</p>
          <h2 id="lc-tour-intro-title">${copy.introTitle}</h2>
          <p class="lc-tour-intro-copy">${copy.introText}</p>
          <p class="lc-tour-duration">${copy.duration}</p>
          <div class="lc-tour-intro-actions">
            <button type="button" class="lc-tour-button lc-tour-button--primary" data-tour-start>${copy.guided} →</button>
            <button type="button" class="lc-tour-button" data-tour-free>${copy.free}</button>
          </div>
        </section>
      </div>`;
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    container.querySelector('[data-tour-start]')?.addEventListener('click', () => {
      setState(transitionTour(state, { type: 'start' }, CAMP_TOUR_STEPS.length));
      trackTourEvent('tour_start', 0);
      const changed = navigateTo(CAMP_TOUR_STEPS[0]!, locale);
      if (!changed) renderCard();
    });
    container.querySelectorAll('[data-tour-free]').forEach((button) => {
      button.addEventListener('click', () => exit());
    });
    removeKeyboardHandler = trapDialog(dialog, () => exit());
    focusFirst(dialog);
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-camp-tour-trigger]') : null;
    if (!trigger) return;
    event.preventDefault();
    lastTrigger = trigger;
    if (state.status === 'paused') {
      trackTourEvent('tour_resume', state.stepIndex);
      setState(transitionTour(state, { type: 'resume' }, CAMP_TOUR_STEPS.length));
      const changed = navigateTo(CAMP_TOUR_STEPS[state.stepIndex]!, locale);
      if (!changed) renderCard();
      return;
    }
    setState(transitionTour(state, { type: 'open' }, CAMP_TOUR_STEPS.length));
    renderIntro();
  });

  window.addEventListener('hashchange', () => {
    if (state.status === 'active') {
      clearRoot();
      window.setTimeout(renderCard, 80);
    }
  });

  setTriggerLabels(state, locale);
  if (state.status === 'active') renderCard();
  else if (state.status === 'paused') renderResume();
  else if (state.status === 'intro') renderIntro();
}

export function initCampTour(): void {
  if (typeof window === 'undefined') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}
