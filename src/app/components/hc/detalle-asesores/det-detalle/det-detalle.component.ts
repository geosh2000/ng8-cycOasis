import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

import { UploadImageComponent } from '../../../formularios/upload-image.component';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../../globals';

@Component({
  selector: 'app-det-detalle',
  templateUrl: './det-detalle.component.html',
  styles: []
})
export class DetDetalleComponent implements OnChanges {

  @Input() asesor:any
  @Output() error = new EventEmitter<any>()

  @ViewChild(UploadImageComponent,{static:false}) _image:UploadImageComponent

  loading:Object = {}

  data:Object = {}
  asesorImage:any = ''

  detalles:any =[
    {icon: 'fas fa-user-tag',   field: 'id',          class: '' },
    {icon: 'far fa-address-card',field: 'num_colaborador',class: '' },
    {icon: 'fas fa-user',       field: 'N Corto',     class: '' },
    {icon: 'fas fa-key',        field: 'profile_name',class: '' },
    {icon: 'fas fa-briefcase',  field: 'Supervisor',  class: '' },
    {icon: 'fab fa-codepen',    field: 'nombre_dep',  class: '' },
    {icon: 'fas fa-cogs',       field: 'nombre_puesto',class: 'font-weight-bold' },
    {icon: 'fas fa-barcode',    field: 'codigo',       class: 'text-primary' },
    {icon: 'far fa-building',   field: 'PDV',         class: '' },
  ]

  contacto:any =[
    {icon: 'fas fa-phone',       field: 'Telefono1',      class: '' },
    {icon: 'fas fa-mobile-alt',  field: 'Telefono2',      class: '' },
    {icon: 'fas fas fa-at',      field: 'username',  class: '' },
    {icon: 'far fa-envelope-open',field: 'correo_personal',  class: '' },
    {icon: 'far fa-address-book',field: 'Vigencia_Pasaporte',class: '' },
    {icon: 'far fa-paper-plane',    field: 'Vigencia_Visa',       class: '' },
    {icon: 'fas fa-birthday-cake',  field: 'Fecha_Nacimiento',    class: '' },
    {icon: 'fas fa-qrcode',       field: 'RFC',       class: '' },
  ]

  constructor(
              public _api: ApiService,
              public toastr: ToastrService,
              public _init:InitService,
            ) {
    if( this.asesor ){
      this.getData()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if( this.asesor ){
      this.getData()
    }
  }

  getData(){
    if( this.asesor != undefined ){
     
      this.loading['data'] = true

      this._api.restfulGet( this.asesor,'DetalleAsesores/detalle' )
                .subscribe( res => {

                  this.loading['data'] = false
                  this.data = res['data']
                  this.updateImg( this.data['num_colaborador'] )

                }, err => {
                  console.log('ERROR', err)

                  this.loading['data'] = false

                  let error = err.error
                  this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                  console.error(err.statusText, error.msg)

                })
    }
  }

  uploadFoto(){
    if( !this.data['num_colaborador'] ){
      let msg = 'No es posible asignar imagenes a asesores sin número de colaborador'
      console.error( msg )
      this.toastr.error( msg, 'Error!' )
    }else{
      this._image.build( `Foto para ${this.data['Nombre']}`, 'asesores', this.data['num_colaborador'])
    }
  }

  upldCheck( event ){
    console.log( event )
    if( event.ERR ){
      this.toastr.error( event.msg, 'Error!' )
    }else{
      this.toastr.success( 'Imagen cargada',' Guardado!' )
      this.updateImg( this.data['num_colaborador'] )
    }
  }

  updateImg( img ){
    let d = new Date()
    this.asesorImage=`${Globals.APISERV}/img/asesores/${ img }.jpg?${d.getTime()}`
  }

  noImage(){
    this.asesorImage='assets/img/no-image.png'
  }

  saved( event ){
    if( event.success ){
      this.getData()
    }
  }

}
