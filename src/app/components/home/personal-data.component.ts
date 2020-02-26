import { Component, OnInit, ViewContainerRef, Input, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ApiService } from '../../services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styles: []
})
export class PersonalDataComponent implements OnInit {

  @Input() asesor:any
  @Input() name:any

  saveDataLoading:boolean = false
  personalDataLoading:boolean = false

  username:string

  personales:Object = {
    Telefono1:            '',
    Telefono2:            '',
    correo_personal:      '',
    Vigencia_Pasaporte:   { year: '', month:'', day:''},
    Vigencia_Visa:        { year: '', month:'', day:''}
  }

  constructor( private _api:ApiService,
                public toastr: ToastrService ) {  }

  getData(){

    this.personalDataLoading = true

    this._api.restfulGet( this.asesor, "Asesores/personalData" )
            .subscribe( res => {
              this.personalDataLoading = false

              this.personales['Telefono1']          = res['data']['Telefono1']
              this.personales['Telefono2']          = res['data']['Telefono2']
              this.personales['correo_personal']    = res['data']['correo_personal']
              this.personales['Vigencia_Pasaporte'] = this.breakDate( res['data']['Vigencia_Pasaporte'] )
              this.personales['Vigencia_Visa']      = this.breakDate( res['data']['Vigencia_Visa'] )

              this.username = res['data']['Usuario']

            }, err => {

              this.personalDataLoading = false

              if(err){
                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              }
            })

  }


  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  breakDate( date ){

    if( date == '0000-00-00' || date == null ){
      return null
    }

    let fecha = moment( date )

    return { year: parseInt( fecha.format('YYYY') ), month: parseInt( fecha.format('MM') ), day: parseInt( fecha.format('DD') ) }
  }

  submitPersonalData(){

    let datos = this.personales

    datos['Vigencia_Pasaporte']  = this.implodeDate( datos['Vigencia_Pasaporte'] )
    datos['Vigencia_Visa']       = this.implodeDate( datos['Vigencia_Visa'] )

    let params = {data: datos, id: this.asesor}


    this.saveDataLoading = true

    this._api.restfulPut( params, 'Asesores/savePersonalData' )
            .subscribe( res => {

              this.saveDataLoading = false

              console.log( res['data'] )

              this.getData()

            }, err => {

              this.saveDataLoading = false

              if(err){
                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              }
            })

  }

  implodeDate( obj ){

    if( obj == null ){
      return '0000-00-00'
    }

    let date = moment( `${obj.year}/${obj.month}/${obj.day}` )

    return date.format( 'YYYY-MM-DD' )
  }

}
