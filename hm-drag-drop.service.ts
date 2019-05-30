import { Injectable, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HmDragDropService {
  resize$ = new Subject();
  addStyle(render: Renderer2, elm: HTMLElement, style: { [key: string]: string | number } = {}) {
    Object.entries(style).forEach(([key, value]) => {
      render.setStyle(elm, key, value);
    });
  }
}
