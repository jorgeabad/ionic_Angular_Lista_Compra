import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarListaPage } from './editar-lista.page';

const routes: Routes = [
  {
    path: '',
    component: EditarListaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarListaPageRoutingModule {}
