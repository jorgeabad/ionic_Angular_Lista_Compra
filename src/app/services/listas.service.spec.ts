import { TestBed } from '@angular/core/testing';

import { ListasService } from './listas.service';

describe('ListasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ListasService = TestBed.get(ListasService);
    expect(service).toBeTruthy();
  });
});
