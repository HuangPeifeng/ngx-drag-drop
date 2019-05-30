import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  Input,
} from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HmDragDropService } from '../hm-drag-drop.service';
import { CornerButtonList } from '../hm-resize-corner-button-list';

@Directive({
  selector: '[hmResize]',
})
export class HmResizeDirective implements AfterViewInit, OnDestroy {
  index: number;
  container: HTMLElement;

  @Input() minWidth = 10;
  @Input() minHeight = 10;

  @Output() resizeComplete = new EventEmitter();

  private hmList: HammerManager[];
  private btnList: HTMLElement[];
  private elm: HTMLElement;
  private destory$ = new Subject<boolean>();


  get elmTop() {
    return this.elm.offsetTop;
  }
  set elmTop(value: number) {
    this.elm.style.top = `${value}px`;
  }

  get elmLeft() {
    return this.elm.offsetLeft;
  }
  set elmLeft(value: number) {
    this.elm.style.left = `${value}px`;
  }

  get elmWidth() {
    return this.elm.offsetWidth;
  }
  set elmWidth(value: number) {
    const paddingWidth = this.elm.clientWidth - this.elm.offsetWidth;
    this.elm.style.width = `${(value < this.minWidth ? this.minWidth : value) - paddingWidth}px`;
  }

  get elmHeight() {
    return this.elm.offsetHeight;
  }
  set elmHeight(value: number) {
    this.elm.style.height = `${value < this.minHeight ? this.minHeight : value}px`;
  }


  constructor(
    private eleRef: ElementRef,
    private renderer: Renderer2,
    private service: HmDragDropService,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        this.elm = this.eleRef.nativeElement;
        this.btnList = CornerButtonList.map(btnDetail => this.createCornerBtn(btnDetail));
        this.hmList = this.btnList.map(btn => new Hammer(btn));
        this.hmList.forEach((hm, i) => {
          this.bindResize(hm, CornerButtonList[i].type)
            .pipe(takeUntil(this.destory$))
            .subscribe();
        });
      });
    }, 0);
  }

  private bindResize(hm: HammerManager, type: string = null): Observable<any> {
    let containerRect: ClientRect | DOMRect;

    hm.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    const panStart$ = fromEvent<HammerInput>(hm, 'panstart');
    const panMove$ = fromEvent<HammerInput>(hm, 'panmove');
    const panEnd$ = fromEvent<HammerInput>(hm, 'panend');

    const addContainerStyle = (pmEvent: HammerInput, boundingClientRect: ClientRect | DOMRect) => {
      const addUpperStyle = () => {
        if (boundingClientRect.top - containerRect.top + pmEvent.deltaY < 0) {
          if (type.startsWith('Upper')) {
            this.elmTop = 0;
            this.elmHeight = boundingClientRect.top + boundingClientRect.height - containerRect.top;
          } else {
            this.elmHeight = boundingClientRect.height + pmEvent.deltaY;
          }
          return;
        }
        if (
          boundingClientRect.top + boundingClientRect.height + pmEvent.deltaY >
          containerRect.top + containerRect.height
        ) {
          if (type.startsWith('Upper')) {
            this.elmTop = boundingClientRect.top - containerRect.top + pmEvent.deltaY;
            this.elmHeight = boundingClientRect.height - pmEvent.deltaY;
          } else {
            this.elmHeight = containerRect.top + containerRect.height - boundingClientRect.top;
          }
          return;
        }

        if (type.startsWith('Upper')) {
          this.elmTop = boundingClientRect.top - containerRect.top + pmEvent.deltaY;
          this.elmHeight =
            boundingClientRect.top - containerRect.top - this.elmTop + boundingClientRect.height;
        } else {
          this.elmHeight = boundingClientRect.height + pmEvent.deltaY;
        }
      };

      const addLowerStyle = () => {
        if (boundingClientRect.left - containerRect.left + pmEvent.deltaX < 0) {
          if (type.endsWith('Left')) {
            this.elmLeft = 0;
            this.elmWidth = boundingClientRect.left + boundingClientRect.width - containerRect.left;
          } else {
            this.elmWidth = boundingClientRect.width + pmEvent.deltaX;
          }
          return;
        }
        if (
          boundingClientRect.left + boundingClientRect.width + pmEvent.deltaX >
          containerRect.left + containerRect.width
        ) {
          if (type.endsWith('Left')) {
            this.elmLeft = boundingClientRect.left - containerRect.left + pmEvent.deltaX;
            this.elmWidth = boundingClientRect.width - pmEvent.deltaX;
          } else {
            this.elmWidth = containerRect.left + containerRect.width - boundingClientRect.left;
          }
          return;
        }

        if (type.endsWith('Left')) {
          this.elmLeft = boundingClientRect.left - containerRect.left + pmEvent.deltaX;
          this.elmWidth =
            boundingClientRect.left - containerRect.left - this.elmLeft + boundingClientRect.width;
        } else {
          this.elmWidth = boundingClientRect.width + pmEvent.deltaX;
        }
      };
      addUpperStyle();
      addLowerStyle();
    };

    const emitResizeComplete = () => {
      const rect = this.elm.getBoundingClientRect();
      this.resizeComplete.emit({
        index: this.index,
        style: {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          height: rect.height,
          width: rect.width,
        },
      });
    };

    const panMoveHanlder = (boundingClientRect: ClientRect | DOMRect) =>
      panMove$.pipe(
        tap(pmEvent => addContainerStyle(pmEvent, boundingClientRect)),
        takeUntil(panEnd$.pipe(tap(emitResizeComplete))),
      );

    return panStart$.pipe(
      tap(() => (containerRect = this.container.getBoundingClientRect())),
      map(() => this.elm.getBoundingClientRect()),
      tap(() => this.service.resize$.next()),
      switchMap(panMoveHanlder),
    );
  }

  private createCornerBtn(btnDetail) {
    const btn = this.renderer.createElement('div') as HTMLElement;
    this.service.addStyle(this.renderer, btn, btnDetail.defaultStyle);
    this.renderer.appendChild(this.elm, btn);
    return btn;
  }

  ngOnDestroy(): void {
    for (const hm of this.hmList) {
      hm.destroy();
    }
    this.destory$.next(true);
  }
}
