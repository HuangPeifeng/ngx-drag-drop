import { AfterViewInit, ContentChildren, Directive, ElementRef, QueryList } from '@angular/core';
import { HmDragDirective } from './hm-drag.directive';
import { HmResizeDirective } from './hm-resize.directive';

@Directive({
  selector: '[hmDropList]',
  exportAs: 'hmDropList',
})
export class HmDropListDirective implements AfterViewInit {
  @ContentChildren(HmDragDirective) hmDragList: QueryList<HmDragDirective>;
  @ContentChildren(HmResizeDirective) hmResizeList: QueryList<HmResizeDirective>;

  constructor(private element: ElementRef) {}

  ngAfterViewInit() {
    const elm = this.element.nativeElement;

    let i = 0;
    for (const hmDrag of this.hmDragList.toArray()) {
      hmDrag.index = i;
      hmDrag.container = elm;
      i++;
    }

    i = 0;
    for (const hmResize of this.hmResizeList.toArray()) {
      hmResize.index = i;
      hmResize.container = elm;
      i++;
    }
  }
}
