import { Component, OnInit } from "@angular/core";
import { Lista } from "src/app/modelos/lista";
import { Producto } from "src/app/modelos/producto";
import { ListasService } from "src/app/services/listas.service";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
/**
 *Clase para mostrar, eliminar y compartir los productos de una lista de la compra.
 *Permite acceder al componente que permite añadir y editar productos de una lista.
 * @export
 * @class ListaPage
 * @implements {OnInit}
 */
@Component({
  selector: "app-lista",
  templateUrl: "./lista.page.html",
  styleUrls: ["./lista.page.scss"],
})
export class ListaPage implements OnInit {
  //almacenar la lista deseada
  lista: Lista = {
    nombre: "",
    fecha: null,
    productos: null,
    total: 0,
    coordenadas: null,
  };

  constructor(
    private listaService: ListasService,
    private router: Router,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private socialSharing: SocialSharing
  ) {}

  ngOnInit() {
    //recuperamos la lista según por id
    const id = this.route.snapshot.paramMap.get("id");
    if (id != null) {
      this.lista = this.listaService.getLista(+id);
    }
  }

  /**
   * Método que permite navegar al componente "producto" que permite añadir y editar un producto
   * se identifica por el id de la lista y el id del producto.
   * @param idList id de la lista
   * @param id id del producto
   */
  goEditProducto(idList: number, id: number) {
    this.router.navigateByUrl(
      `/producto${id != undefined ? "/" + idList + "/" + id : "/" + idList}`
    );
  }

  /**
   * Método para eliminar un producto del array de productos de la lista por su id
   * @param id id del producto a eliminar
   */
  eliminarProducto(id: number) {
    //almacenamos un array que contiene todos los productos menos el del id pasado
    this.lista.productos = this.lista.productos.filter((p) => p.id != id);
    //actulizamos el totalizador de los precios de la lista
    this.lista.total = this.lista.productos.reduce(
      (sum, p) => sum + p.precio,
      0
    );
    //guardamos la lista
    this.listaService.saveLista(this.lista);
  }

  /**
   * Método que permite realizar una copia exacta de una lista de la compra.
   * @param listaOriginal lista que se quiere clonar
   */
  nuevaLista(listaOriginal: Lista) {
    let nueva = JSON.parse(JSON.stringify(listaOriginal)); //copia
    nueva.id = null; //modificamos el id para la nueva lista
    nueva.fecha = new Date().toISOString(); //modificamos fecha para la nueva lista
    nueva.nombre = nueva.nombre + "(1)"; //modificamos nombre para la nueva lista
    this.listaService.saveLista(nueva); //añmacenamos la nueva lista
    this.router.navigateByUrl("/home"); //volvemos a la página de inicio.
  }
  /**
   * Cambia el valor del atributo "marcado" de un producto true o false
   * @param id id del producto
   */
  onSelect(id: number) {
    //guardamos la lista
    this.listaService.saveLista(this.lista);
  }
  /**
   * Método para compartir los productos de una lista
   * @param message array con los productos de la lista
   * @param subject nombre de de la lista.
   */
  compartir(message, subject) {
    let lista = "";
    const m = message.map((item) => {
      let p = "";
      p =
        "-" +
        item.nombre +
        "=> uds:" +
        item.cantidad +
        ", precio:" +
        item.precio;
      return "\n" + lista + p;
    }); //formateamos el array de productos a una cadena
    //Compartimos la cadena creada usando native socialSharing
    this.socialSharing.share(m.toString(), subject, null, null);
  }
  /**
   * Método que pide confirmación para elimnar un producto, se le pasa el
   * id del producto que se quiere elimnar y su nombre.
   * @param id id del producto a eliminar
   * @param title nombre del producto.
   */
  async presentAlertConfirm(id: number, title: string) {
    console.log("alerta");
    const alert = await this.alertController.create({
      header: "Eliminar producto",
      message: `¿Estás seguro que quieres borrar el producto <strong> ${title}</strong>?`,
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Aceptar",
          handler: () => {
            this.eliminarProducto(id);
          },
        },
      ],
    });

    await alert.present();
  }
}
