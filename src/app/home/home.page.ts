import { Component } from "@angular/core";
import { Lista } from "../modelos/lista";
import { ListasService } from "../services/listas.service";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { Platform } from "@ionic/angular";
import { OnInit, OnDestroy, AfterViewInit } from "@angular/core";
/**
 *
 *
 * @export
 * @class HomePage
 * @implements {OnInit}
 */
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  listas: Lista[] = []; //array de listas para mostrar todas las listas
  lat = null; //almacenar latidud actual
  lng = null; //almacenar longitud actual
  listaCercana: Lista; //para mostrar la lista mas cercana a la ubicación actual
  backButtonSubscription;

  constructor(
    private listasService: ListasService,
    private router: Router,
    private alertController: AlertController,
    private geolocation: Geolocation,
    private platform: Platform
  ) {}

  ngOnInit() {}

  /**Al entrar en su correspondiente vista nos suscribimos al evento */
  ionViewWillEnter() {
    
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      navigator["app"].exitApp();
    });
    //recuperamos las listas
    this.listasService.getListas().then((data) => (this.listas = data));
  }

  /**
   * Al salir de su vista,
   */
  ionViewWillLeave() {
    this.backButtonSubscription.unsubscribe();
  }

  /**
   * Función que navega a la vista "editar-lista" por el id de la lista
   * @param id id de la lista que se quiere editar.
   */
  goEditLista(id: number) {
    this.router.navigateByUrl(
      `/editar-lista${id != undefined ? "/" + id : ""}`
    );
  }
  /**
   * Función que navega a la vista "lista" por su id
   * @param id id de la lista de la que se quiere resuperar los datos.
   */
  goLista(id: number) {
    this.router.navigateByUrl(`/lista${id != undefined ? "/" + id : ""}`);
  }
  /**
   * Función que elimina una lista por su id
   * @param id id de de la lista a eliminar.
   */
  deleteLista(id: number) {
    this.listasService
      .deleteLista(id)
      .then(() =>
        this.listasService.getListas().then((data) => (this.listas = data))
      );
  }
  /**
   * Función para formatear la fecha en la vista, formato dd/MM/aaaa
   * @param d cadena que contiene la fecha que fue almacenada.
   */
  fecha(d: string) {
    let d2 = Date.parse(d);
    let d3 = new Date(d2);
    const options2 = { year: "numeric", month: "numeric", day: "numeric" };
    let d4 = d3.toLocaleDateString("es-ES", options2);
    return d4;
  }
  /**
   * Función que muestra una alerta solicitando la confirmación
   * para la eliminación de una lista recibe el id y nombre de la lista
   * llama a deleteLista pasandole el id de la lista a eliminar.
   * @param id id de la lista a eliminar
   * @param title nombre de la lista.
   */
  async presentAlertConfirm(id: number, title: string) {
    const alert = await this.alertController.create({
      header: "Borrar Lista",
      message: `¿Estás seguro que quieres borrar la lista <strong> ${title}</strong>?`,
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Aceptar",
          handler: () => {
            this.deleteLista(id);
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Función que devuelve la lista más cercana a la posición actual, aplica el método
   * "menorDistancia" a cada elemento del array "listas", para encontrar la lista más cercana
   * al punto actual, una vez obtenida la lista más cercana la almacenamos en la letiable
   * "listaCercana".
   */
  buscar() {
    //hallamos lista más cercana.
    let l = this.listas.reduce((lAnt, lAct) => this.menorDistancia(lAnt, lAct));
    alert("Lista más cercana: " + l.nombre); //mostramos el nombre de la lista más cercana
    this.listaCercana = l; //almacenamos la lista más cercana.
  }

  /**
   * Función para obtener la ubicación actual, almacena la latitud y longitud
   * en las variables lat y lng, una vez obtenida la ubicación actual llama al método
   * buscar() para obtener la lista más cercana al punto actual.
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
          this.lat = resp.coords.latitude;
          this.lng = resp.coords.longitude;

          alert("Coordenadas obtenidas: " + this.lat + "," + this.lng);
          this.buscar();
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

  /**
   * Función que recibe dos listas y devuelve la lista más cercana a la posición actual
   * en función de las coordenadas almacenadas en las listas y en los letiables lat y lng,
   * para calcular la distancia del punto actual a al punto de la lista hace uso del método
   * distance.
   * @param l1 Lista
   * @param l2 Lista
   */
  menorDistancia(l1: Lista, l2: Lista) {
    let d1 = this.distance(
      //distancia punto actual a l1
      this.lat, //latitud punto actual
      this.lng, //longitud punto actual
      l1.coordenadas.latitud, //latitud de la lista 1
      l1.coordenadas.longitud, //longitud de la lista 1
      "K"
    );
    let d2 = this.distance(
      //distancia punto actual a l2
      this.lat, //latitud punto actual
      this.lng, //longitud punto actual
      l2.coordenadas.latitud, //latitud de la lista 2
      l2.coordenadas.longitud, ////longitud de la lista 2
      "K"
    );
    return d1 < d2 ? l1 : l2; //si d1 es menor que d2 devuelve l1 si no l2
  }

  /**
   * Función para calcular la distancia entre dos puntos usando
   * la fórmula del semiverseno.
   * Los puntos vienen determinados por su latitud y longitud
   * @param lat1 latitud origen
   * @param lon1 longitud origen
   * @param lat2 latitud destino
   * @param lon2 longitud destino
   * @param unit unidad kilometros o millas
   */
  distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      console.log(lat1, lon1, lat2, lon2, unit);
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  }
}
