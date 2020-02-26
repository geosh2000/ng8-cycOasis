import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-det-vacaciones',
  templateUrl: './det-vacaciones.component.html',
  styles: []
})
export class DetVacacionesComponent implements OnChanges {

  @Input() asesor:any
  @Input() curAsesor:any
  @Input() time:any
  @Output() error = new EventEmitter<any>()
  @Output() reload = new EventEmitter<any>()

  loading:Object = {}
  deleteItem:Object = {}
  activo:any
  dataHistorial:any = []
  detalleHistorial:any = []
  dataSolicitudes:Object = {}
  contratos:Object = {}

  constructor(public _api: ApiService,
              public toastr: ToastrService,
              public _init:InitService) {

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  getData(){
    this.getHistorial()
  }

  getHistorial(){
    this.loading['vacaciones'] = true

    this._api.restfulGet( this.asesor,'DetalleAsesores/vacaciones' )
              .subscribe( res => {

                this.loading['vacaciones'] = false
                this.dataHistorial = res['data']
                this.detalleHistorial = res['detalle']

              }, err => {
                console.log('ERROR', err)

                this.loading['vacaciones'] = false
                let error = err.error
                this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                console.error(err.statusText, error.msg)

              })
  }

  printDate(date, format){
    return date ? moment.tz(date, 'this._zh.defaultZone').tz('America/Bogota').format(format) : '-'
  }

  err( data ){
    this.toastr.error(data.msg, data.code)
  }

  succ( data ){
    if( !data.toastrOff ){
      this.toastr.success( 'Solicitud guardada correctamente', 'Guardado!')
    }
    this.getData()
  }


}
