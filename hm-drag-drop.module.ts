import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HmDragDirective, HmDropListDirective, HmResizeDirective } from './directives';

const Directives = [HmDragDirective, HmDropListDirective, HmResizeDirective];

@NgModule({
  declarations: [Directives],
  imports: [CommonModule],
  exports: [Directives],
})
export class HmDragDropModule {}
