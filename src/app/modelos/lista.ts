
import { Producto } from './producto';

export class Lista {
    id?: number;
    nombre: string;
    fecha: Date;
    productos: Producto[]
    total:number;
    coordenadas:{latitud:number,longitud:number}
  }
