import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditarListaPage } from './editar-lista.page';

describe('EditarListaPage', () => {
  let component: EditarListaPage;
  let fixture: ComponentFixture<EditarListaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarListaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
