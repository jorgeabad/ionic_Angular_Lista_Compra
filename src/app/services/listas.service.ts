import { Injectable } from "@angular/core";
import { Lista } from "../modelos/lista";
import { Storage } from "@ionic/storage";
/**
 *Clase que permite almacenar las listas en ionic Storage.
 *
 * @export
 * @class ListasService
 */
@Injectable({
  providedIn: "root",
})
export class ListasService {
  //array para guardar las listas, elemento a almacenar en ionic storage
  listas: Lista[] = [];

  //al iniciar recuperamos el array con todas las listas
  constructor(private storage: Storage) {
    this.getListas().then((data) => (this.listas = data == null ? [] : data));
  }
  
  /**
   * Devuelve el array que contiene todas las listas
   */
  public getListas(): Promise<Lista[]> {
    return this.storage.get("listas");
  }
  /**
   * Método que devuelve una lista pasando el id de la lista.
   * @param id id de la lista arecuperar
   */
  public getLista(id: number): Lista {
    return this.listas.filter((t) => t.id == id)[0];
  }
  /**
   * Método para almacenar una lista
   * @param l lista a almacenar
   */
  public saveLista(l: Lista): Promise<boolean> {
    if (l.id == undefined) {
      // Nueva Lista
      const maxId = this.listas.reduce(
        (max, t) => (t.id > max ? t.id : max),
        -1
      );
      const nuevaLista = {
        id: maxId + 1,
        nombre: l.nombre,
        fecha: l.fecha,
        productos: l.productos,
        total: l.total,
        coordenadas: l.coordenadas,
      };
      this.listas.push(nuevaLista);
    } else {
      // Editar lista
      this.deleteLista(l.id);
      this.listas.push(l);
      this.listas.sort((l1, l2) => (l1.id < l2.id ? -1 : 1));
    }
    return this.storage.set("listas", this.listas);
  }
  /**
   * Método para eliminar una lista pasando su id.
   * @param id id de la lista a eliminar
   */
  public deleteLista(id: number): Promise<boolean> {
    this.listas = this.listas.filter((t) => t.id != id);
    return this.storage.set("listas", this.listas);
  }
}
