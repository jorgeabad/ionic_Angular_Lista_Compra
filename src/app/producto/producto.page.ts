import { Component, OnInit } from "@angular/core";
import { Lista } from "src/app/modelos/lista";
import { Producto } from "src/app/modelos/producto";
import { ListasService } from "src/app/services/listas.service";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { OCR, OCRSourceType, OCRResult } from "@ionic-native/ocr/ngx";
import {
  Camera,
  CameraOptions,
  PictureSourceType,
} from "@ionic-native/camera/ngx";

@Component({
  selector: "app-producto",
  templateUrl: "./producto.page.html",
  styleUrls: ["./producto.page.scss"],
})
export class ProductoPage implements OnInit {
  //para almacenar la lista origen
  lista: Lista = {
    nombre: "",
    fecha: null,
    total: 0,
    coordenadas: null,
    productos: [],
  };
  //para almacenar el nuevo producto o el editado
  producto: Producto = {
    nombre: "",
    cantidad: null,
    precio: null,
    marcado: false,
  };
  idLista: String; //almacenar el id de la lista origen
  imageData: string; //almacenar uri de la imagen
  textoImagen: string; //almacenar texto reconocido

  constructor(
    private ListaService: ListasService,
    private route: ActivatedRoute,
    private router: Router,
    public alertController: AlertController,
    private camera: Camera,
    private ocr: OCR
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id"); //id del producto a editar
    const idList = this.route.snapshot.paramMap.get("idList"); //id de la lista a la que pertenece el producto
    this.idLista = idList; //almacenamos el id de lista
    this.lista = this.ListaService.getLista(+idList); //recuperamos la lista
    if (id != null) {
      //si se paso el id del producto
      this.producto = this.lista.productos.find((e) => e.id.toString() === id); //lo obtenemos del array de productos de la lista
    }
    //si no se paso el producto la vista estará vacía para crear un nuevo producto.
  }

  /**
   * Método para añadir un nuevo producto a la lista o modificar un exixtente
   * @param t Producto añadido o modificado.
   */
  public saveProducto(t: Producto) {
    //se verifca los datos básicos del producto, precio, nombre, cantidad
    if (t.precio <= 0 || t.cantidad <= 0 || t.nombre == "") {
      this.presentAlert(t); //si no se cumple se informa
      return;
    }
    if (t.id == undefined) {
      // añadir nuevo producto no tiene id asignado.
      const maxId = this.lista.productos.reduce(
        (max, t) => (t.id > max ? t.id : max),
        -1
      ); //hallamos el id mayor
      const nuevoProducto = {
        id: maxId + 1,
        nombre: t.nombre,
        cantidad: t.cantidad,
        precio: t.precio,
        marcado: t.marcado,
      };
      this.lista.productos.push(nuevoProducto); //almacenamos el producto en el array productos de la lista.
    } else {
      // Editar un producto existente que ya tiene id
      this.deleteProducto(t.id); //eliminamos el producto del array de productos de la lista
      this.lista.productos.push(t); //añadimos el producto ya modificado
      this.lista.productos.sort((t1, t2) => (t1.id < t2.id ? -1 : 1)); //ordenamos la lista por id
    }
    //hallamos el sumatorio de todos los productos
    this.lista.total = this.lista.productos.reduce(
      (sum, p) => sum + p.precio,
      0
    );
    //Guardamos la lista en storage
    this.ListaService.saveLista(this.lista);
    let id = this.route.snapshot.paramMap.get("id");
    //Volvemos al la lista origen despues de añadir el producto.
    this.router.navigateByUrl(
      `/lista${this.idLista != undefined ? "/" + this.idLista : ""}`
    );
  }
  
  /**
   * Método para eliminar un producto del array de productos de la lista por su id
   * @param id id del producto a eliminar
   */
  public deleteProducto(id: number): Promise<boolean> {
    //almacenamos un array que contiene todos los productos menos el del id pasado
    this.lista.productos = this.lista.productos.filter((t) => t.id != id);
    return this.ListaService.saveLista(this.lista); //guardamos la lista.
  }

  /**
   * Valida los atributos nombre, precio, cantidad del producto que queremos añadir a la lista.
   * @param p producto pasado
   */
  async presentAlert(p) {
    let mensaje = "";
    p.nombre == "" ? (mensaje = "-El nombre no puede estar vacío") : "";
    p.precio <= 0
      ? (mensaje = mensaje + "\n-El precio ha de ser mayor a cero")
      : "";
    p.cantidad <= 0
      ? (mensaje = mensaje + "\n-Ha de indicar unidades del producto")
      : "";
    const alert = await this.alertController.create({
      header: "Atención",
      subHeader: "Campos omitidos o incorrectos",
      message: mensaje,
      buttons: ["Aceptar"],
    });

    await alert.present();
  }
  /**Permite acceder a la camara y tomar una imagen una vez tomada la imagen
   * almacena su ruta y llama al método recognizeText() para reconocer el texto de la imagen */
  getPicture(sourceType: PictureSourceType) {
    this.camera
      .getPicture({
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: sourceType,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        allowEdit: true,
        saveToPhotoAlbum: false,
        correctOrientation: true,
      })
      .then(
        (imageURI) => {
          this.imageData = imageURI; //almacenamos la ruta de la imagen

          this.recognizeText();
        },
        (err) => {
          console.error(err);
        }
      );
  }
  /**Método para reconocer el texto de una imagen cuya ruta está almacenada en
   * la variable imageData, si reconoce el texto lo almacena como una cadena
   * en la variable "textoImagen".
   */
  recognizeText() {
    this.ocr
      .recText(OCRSourceType.NORMFILEURL, this.imageData)
      .then((res: OCRResult) => {
        if (res.foundText) {
          this.textoImagen = res.blocks.blocktext.toString();
          this.producto.nombre = this.textoImagen;
        } else {
          alert("no hay texto"); //no se reconoce ningún texto.
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  }
}
