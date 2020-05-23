import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarListaPageRoutingModule } from './editar-lista-routing.module';

import { EditarListaPage } from './editar-lista.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarListaPageRoutingModule
  ],
  declarations: [EditarListaPage]
})
export class EditarListaPageModule {}
