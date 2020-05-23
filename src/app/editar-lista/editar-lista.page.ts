import { Component, OnInit } from "@angular/core";
import { Lista } from "src/app/modelos/lista";
import { ListasService } from "src/app/services/listas.service";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { Geolocation } from "@ionic-native/geolocation/ngx";

/**
 * Clase para editar una lista existente o crear una nueva lista
 * Puede hacer uso de la geolocalización para obtener la latitud, longitud
 * Usa ListaService para almacenar la lista.
 * @export
 * @class EditarListaPage
 * @implements {OnInit}
 */
@Component({
  selector: "app-editar-lista",
  templateUrl: "./editar-lista.page.html",
  styleUrls: ["./editar-lista.page.scss"],
})
export class EditarListaPage implements OnInit {
  lista: Lista = {
    //almacenar una nueva lista o la recuperda.
    nombre: "",
    fecha: null,
    productos: [],
    total: 0,
    coordenadas: { latitud: null, longitud: null },
  };

  constructor(
    private listasService: ListasService,
    private route: ActivatedRoute,
    private router: Router,
    public alertController: AlertController,
    private geolocation: Geolocation
  ) {}

  /**Una vez iniciado el componente, si se ha llegado pasando el parámetro id
   * de una lista, recuperamos los valores de la correspondiente lista, mostrando sus
   * valores en la vista, en el caso de no pasar el id será una nueva lista
   * se mostrará la vista sin valores.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id != null) {
      this.lista = this.listasService.getLista(+id);
    }
  }

  /**Función para obtener la ubicación actual, almacena los valores de la
   * latitud y longitud obtenidas en el objeto coordenadas de la clase lista.
   */
  getUbicacion() {
    this.geolocation
      .getCurrentPosition({
        maximumAge: 1000,
        timeout: 5000,
        enableHighAccuracy: true,
      })
      .then(
        (resp) => {
          let lat = resp.coords.latitude;
          let lng = resp.coords.longitude;
          this.lista.coordenadas = { latitud: lat, longitud: lng };
          alert("Coordenadas obtenidas: " + lat + "," + lng);
        },
        (er) => {
          alert("No se ha podido obtener la localización");
        }
      )
      .catch((error) => {
        alert(
          "Ha ocurrido un error al obtener la localización: " +
            JSON.stringify(error)
        );
      });
  }
  /**Función que verifica el valor de los atributos fecha y nombre de la lista
   * si no están vacíos almacena la lista usando el correspondiente servicio
   * una vez almacenada la lista volvemos al listado de listas.
   */
  guardar() {
    if (this.lista.fecha == null || this.lista.nombre == "") {
      this.presentAlert();
      return;
    }
    this.listasService.saveLista(this.lista);
    this.router.navigateByUrl("/home");
  }

  /**Función para mostrar una advertencia si se intenta guardar una lista sin incluir
   * su nombre o fecha.
   */
  async presentAlert() {
    const alert = await this.alertController.create({
      header: "Atención",
      message: "Los campos nombre y fecha son obligatorios",
      buttons: ["Aceptar"],
    });

    await alert.present();
  }
}
