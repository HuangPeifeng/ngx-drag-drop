import { TestBed } from '@angular/core/testing';

import { HmDragDropService } from './hm-drag-drop.service';

describe('HmDragDropService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HmDragDropService = TestBed.get(HmDragDropService);
    expect(service).toBeTruthy();
  });
});
