import { Component, SimpleChanges, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/service.index';

@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styles: []
})
export class EditDetailsComponent implements OnChanges {

  @Input() data:any
  @Input() element:any
  @Input() nombre:any

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()

  @ViewChild( DaterangePickerComponent,{static:false} ) private picker: DaterangePickerComponent

  formDetail:FormGroup
  listProfiles
  listProfileLoaded:boolean = false

  submitting:boolean = false

  asesorDetails:Object = {
    id: null,
    num_colaborador: null,
    nombre: null,
    apellido: null,
    nombre_corto: null,
    profile: null,
    tel1: null,
    tel2: null,
    correo: null,
    pasaporte: null,
    visa: null,
    rfc: null,
    nacimiento: null
  }

  asesorDetailsForm:Object = {
    id: { tipo: 'text', icon: 'fas fa-user-tag', readonly: true, pattern: ''},
    num_colaborador: { tipo: 'text', icon: 'far fa-address-card', readonly: false, pattern: 'El número de colaborador está compuesto por 8 dígitos'},
    nombre: { tipo: 'text', icon: 'fas fa-user', readonly: false, pattern: 'La primer letra de cada nombre debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada nombre'},
    apellido: { tipo: 'text', icon: 'far fa-user', readonly: false, pattern: 'La primer letra de cada apellido debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada apellido'},
    nombre_corto: { tipo: 'text', icon: 'fas fa-user-ninja', readonly: false, pattern: 'El formato debe ser con Mayúsculas y Minúsculas sin acentos<br>Sólo 1 Nombre y 1 Apellido<br>El formato debe coincidir con: "Nombre Apellido"'},
    profile: { tipo: 'select', icon: 'fas fa-key', readonly: false, pattern: ''},
    tel1: { tipo: 'text', icon: 'fas fa-phone', readonly: false, pattern: '10 dígitos sin espacios ni símbolos'},
    tel2: { tipo: 'text', icon: 'fas fa-mobile-alt', readonly: false, pattern: '10 dígitos sin espacios ni símbolos'},
    correo: { tipo: 'text', icon: 'far fa-envelope-open', readonly: false, pattern: 'El Formato no coincide con un correo correcto'},
    pasaporte: { tipo: 'date', icon: 'far fa-address-book', readonly: false, pattern: ''},
    visa: { tipo: 'date', icon: 'far fa-paper-plane', readonly: false, pattern: ''},
    rfc: { tipo: 'text', icon: 'fas fa-qrcode', readonly: false, pattern: 'El RFC debe estar en mayúsculas<br>El Formato debe coincidir con AAAA######HHH'},
    nacimiento: { tipo: 'date', icon: 'fas fa-birthday-cake', readonly: false, pattern: ''}
  }

  asesorDetailsQueryNames = {
    id: 'id',
    num_colaborador: 'num_colaborador',
    nombre: 'Nombre_Separado',
    apellido: 'Apellidos_Separado',
    nombre_corto: '`N Corto`',
    profile: 'profile',
    tel1: 'Telefono1',
    tel2: 'Telefono2',
    correo: 'correo_personal',
    pasaporte: 'Vigencia_Pasaporte',
    visa: 'Vigencia_Visa',
    rfc: 'RFC',
    nacimiento: 'Fecha_Nacimiento'
  }

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: 'left'
  }

  constructor(
              private _dateRangeOptions: DaterangepickerConfig,
              private _api:ApiService,
              public toastr: ToastrService
              ) {

      this.populateProfiles()

      this.formDetail = new FormGroup({
        id: new FormControl(this.asesorDetails['id'], [ Validators.required ] ),
        num_colaborador: new FormControl(this.asesorDetails['num_colaborador'], [ Validators.pattern('^[0-9]{8}$') ] ),
        nombre: new FormControl(this.asesorDetails['nombre'], [ Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+([ ]{1}([A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+|[dD]{1}[e]{1}[l]{0,1})){0,3}$') ] ),
        apellido: new FormControl(this.asesorDetails['apellido'], [ Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+([ ]{1}[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+|[ ]{1}[a-záéíóúñ]{2,3}){0,5}$') ] ),
        nombre_corto: new FormControl(this.asesorDetails['nombre_corto'], [ Validators.required, Validators.pattern('^[A-Z]{1}[a-z]* [A-Z]{1}[a-z]*$') ], this.userExists.bind(this) ),
        profile: new FormControl(this.asesorDetails['profile'], [ Validators.required ] ),
        tel1: new FormControl(this.asesorDetails['tel1'], [ Validators.pattern('^[1-9]{1}[0-9]{6,9}$') ] ),
        tel2: new FormControl(this.asesorDetails['tel2'], [ Validators.pattern('^[1-9]{1}[0-9]{6,9}$') ] ),
        correo: new FormControl(this.asesorDetails['correo'], [ Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$') ] ),
        pasaporte: new FormControl(this.asesorDetails['pasaporte'], [ ] ),
        visa: new FormControl(this.asesorDetails['visa'], [  ] ),
        rfc: new FormControl(this.asesorDetails['rfc'], [ ] ),
        nacimiento: new FormControl(this.asesorDetails['nacimiento'], [ Validators.pattern('^[1-2]{1}([0]{1}[1-2]{1}|[9]{1}[4-9]{1})[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$') ] )
      })

  }

  ngOnChanges( changes: SimpleChanges ) {
    this.buildForm( this.data )
  }

  populateProfiles(){
    let params = {}
    this._api.restfulGet( '', 'Lists/listProfiles' )
            .subscribe( res => {
              this.listProfiles = res['data']
              this.listProfileLoaded = true
           
            })
  }

  setVal( val, control ){
    this.formDetail.controls[control].setValue( val.format('YYYY-MM-DD') )
  }

  submit(){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    let params = {
      form: this.formDetail.value,
      original: this.asesorDetails,
      queryNames: this.asesorDetailsQueryNames,
      changer: currentUser.hcInfo['id']
    }
    this.submitting = true

    this._api.restfulPut( params, 'Asesores/editUser' )
            .subscribe( res => {
              this.submitting = false
              this.save.emit({ form: '#form_editDetails', success: true })
              jQuery(this.element).modal('hide')
            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)
                this.submitting = false
              }
            })

  }

  buildForm( array ){
    this.asesorDetails = {
      id: array.id,
      num_colaborador: array.num_colaborador,
      nombre: array.Nombre_Separado,
      apellido: array.Apellidos_Separado,
      nombre_corto: array['N Corto'],
      profile: array.profile_id,
      tel1: array.Telefono1,
      tel2: array.Telefono2,
      correo: array.correo_personal,
      pasaporte: !array.Vigencia_Pasaporte || array.Vigencia_Pasaporte == '0000-00-00' ? null : array.Vigencia_Pasaporte,
      visa: !array.Vigencia_Visa || array.Vigencia_Visa == '0000-00-00' ? null : array.Vigencia_Visa,
      rfc: array['RFC'],
      nacimiento: !array.Fecha_Nacimiento || array.Fecha_Nacimiento == '0000-00-00' ? null : array.Fecha_Nacimiento
    }
    this.formDetail.reset(this.asesorDetails)
  }

  userExists( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this

    let promesa = new Promise(
      (resolve, reject) =>{

        let params = {
          user: control.value,
          asesor: thisData.formDetail.controls['id'].value
        }

        thisData._api.postFromApi( params, 'validateUserExists')
          .subscribe( res => {
            if(res){
              if(res.res == 1){
                resolve({existe: true})
              }else{
                resolve(null)
              }
            }
          })

      }
    )
    return promesa
  }

  test( something ){
    console.log( something )
  }
}
