import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadChildren: () => import('./lista/lista.module').then(m => m.ListaPageModule)
  },
  {
    path: 'producto',
    loadChildren: () => import('./producto/producto.module').then(m => m.ProductoPageModule)
  },
  {
    path: 'editar-lista',
    loadChildren: () => import('./editar-lista/editar-lista.module').then( m => m.EditarListaPageModule)
  },
  { path: 'editar-lista/:id', loadChildren: './editar-lista/editar-lista.module#EditarListaPageModule' },
  { path: 'producto', loadChildren: './producto/producto.module#ProductoPageModule' },
  { path: 'producto/:idList', loadChildren: './producto/producto.module#ProductoPageModule' },
  { path: 'producto/:idList/:id', loadChildren: './producto/producto.module#ProductoPageModule' },
  { path: 'lista', loadChildren: './lista/lista.module#ListaPageModule' },
  { path: 'lista/:id', loadChildren: './lista/lista.module#ListaPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
