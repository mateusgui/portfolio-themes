/**
 * `IntersectionObserver` falso para o jsdom. Guarda cada instância criada para os
 * testes simularem seções entrando e saindo da área observada com `trigger`.
 */
export class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  readonly scrollMargin = '0px';
  readonly targets = new Set<Element>();
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? '0px';
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Simula seções entrando (`true`) ou saindo (`false`) da área observada. */
  trigger(changes: Record<string, boolean>) {
    const entries = [...this.targets]
      .filter((target) => target.id in changes)
      .map(
        (target) => ({ target, isIntersecting: changes[target.id] }) as IntersectionObserverEntry,
      );
    this.callback(entries, this);
  }

  /** O observer mais recente ainda ativo. */
  static latest() {
    const observer = MockIntersectionObserver.instances.at(-1);
    if (!observer) throw new Error('Nenhum IntersectionObserver foi criado');
    return observer;
  }
}
