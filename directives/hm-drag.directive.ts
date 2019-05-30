import {
  AfterViewInit,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  TemplateRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HmDragDropService } from '../hm-drag-drop.service';
import { StartPoint } from '../hm-drag-start-point';

@Directive({
  selector: '[hmDrag]',
})
export class HmDragDirective implements AfterViewInit, OnDestroy {
  index: number;
  container: HTMLElement;
  @Output() dragComplete = new EventEmitter();
  private destory$ = new Subject<boolean>();

  private hm: HammerManager;
  private elm: HTMLElement;
  private initGoPoint = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  constructor(
    @Inject(DOCUMENT) private document,
    private element: ElementRef,
    private render: Renderer2,
    private service: HmDragDropService,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        this.elm = this.element.nativeElement as HTMLElement;
        this.hm = new Hammer(this.elm);
        if (this.container) {
          this.bindDrag()
            .pipe(takeUntil(this.destory$))
            .subscribe();
        }
      });
    }, 0);
  }

  bindDrag(): Observable<any> {
    this.hm.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    const goPoint$ = new BehaviorSubject(this.initGoPoint);
    const containerZero = this.container.getBoundingClientRect();

    goPoint$.subscribe(({ left, top }) => {
      if (left || top) {
        this.elm.style.left = left + 'px';
        this.elm.style.top = top + 'px';
      }
    });

    const setCursorStyle = start => {
      if (start) {
        this.render.setStyle(this.elm, 'cursor', '-webkit-grabbing');
        this.render.setStyle(this.elm, 'cursor', 'grabbing');
      } else {
        this.render.setStyle(this.elm, 'cursor', '-webkit-grab');
        this.render.setStyle(this.elm, 'cursor', 'grab');
      }
    };

    const getGoPoint = (startPoint, e) => {
      return {
        left: startPoint.left + e.deltaX,
        top: startPoint.top + e.deltaY,
        width: e.target.offsetWidth,
        height: e.target.offsetHeight,
      };
    };

    const panEnd$ = fromEvent<HammerInput>(this.hm, 'panend');
    const panStart$ = fromEvent<HammerInput>(this.hm, 'panstart').pipe(
      tap(() => setCursorStyle(true)),
      map((e: HammerInput) => ({
        left: e.target.offsetLeft || 0,
        top: e.target.offsetTop || 0,
      })),
    );

    const withGoPoint = (startPoint: { left: number; top: number }) => obs =>
      obs.pipe(
        map(e => getGoPoint(startPoint, e)),
        map((goPoint: StartPoint) => this.getMovePoint(goPoint, containerZero)),
        tap((goPoint: StartPoint) => goPoint$.next(goPoint)),
      );

    const dragComplete = () => {
      const { left, top } = goPoint$.getValue();
      this.dragComplete.emit({
        index: this.index,
        style: {
          top,
          left,
        },
      });
      setCursorStyle(false);
    };

    const whenMoveActionStop = obs =>
      obs.pipe(
        takeUntil(panEnd$.pipe(tap(dragComplete))),
        takeUntil(this.service.resize$),
      );

    const setPanMoveAction = (startPoint: { left: number; top: number }) =>
      fromEvent<HammerInput>(this.hm, 'panmove').pipe(
        withGoPoint(startPoint),
        whenMoveActionStop,
      );

    return panStart$.pipe(switchMap(startPoint => setPanMoveAction(startPoint)));
  }

  private getMovePoint(startPoint: StartPoint, containerZero: ClientRect | DOMRect) {
    if (startPoint.top < 0) {
      startPoint.top = 0;
    }

    if (startPoint.left < 0) {
      startPoint.left = 0;
    }

    if (startPoint.left + startPoint.width > containerZero.width) {
      startPoint.left = containerZero.width - startPoint.width;
    }

    if (startPoint.top + startPoint.height > containerZero.height) {
      startPoint.top = containerZero.height - startPoint.height;
    }

    return startPoint;
  }

  ngOnDestroy(): void {
    this.hm.destroy();
    this.destory$.next(true);
  }
}
