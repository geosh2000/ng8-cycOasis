import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../../../services/service.index';
declare var jQuery:any;

@Component({
  selector: 'app-batch-asesor-form',
  templateUrl: './batch-asesor-form.component.html',
  styles: [`
    .overlay {
      position: absolute;
      top: 0px;
      left:  0px;
      z-index:  50;
      background:  rgba(0,0,0,0.2);
      width:  100%;
      height: 100%;
    }

    .loading-container {
        position:  absolute;
        top: 150px;
        left: 50%;
        width: 375px;
        background: white;
        margin-left: -187.5px;
        text-align: center;
        box-shadow: 0px 0px 2px 1px black;
        z-index: 51;
    }
  `]
})
export class BatchAsesorFormComponent implements OnInit, OnChanges {

  @Input() item:any = []
  @Input() i:any
  @Input() vacantes:any = []
  @Input() profiles:any = []
  @Input() selectVacIndex:Object = {}
  @Input() selectedVac:any = []
  @Input() resetFlag:any = new Date
  @Input() resetVac:any = new Date
  @Input() saving:boolean = false

  @Output() changeVac = new EventEmitter<any>()
  @Output() omitir = new EventEmitter<any>()
  @Output() done = new EventEmitter<any>()

  successSave:boolean = false
  saved:boolean = false
  dataFromUser:boolean = false
  omitido:boolean = false
  reingresoFlag:boolean = false
  difUserFlag:boolean = false
  oldResetFlag:any = new Date
  oldResetVac:any = new Date

  form:FormGroup

  singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: 'left',
    locale: {
      format: 'YYYY/MM/DD'
    }
  }

  loading:Object = {}
  existingUser:any
  existingUserTmp:any

  newId:any
  newError:any = []

  constructor( private _api:ApiService) {
    this.form =  new FormGroup({['a']: new FormControl('')})
    moment.locale('es-MX')
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges){
    if( this.resetFlag != this.oldResetFlag ){
      this.build()
      this.oldResetFlag = this.resetFlag
    }else{
      if( this.resetVac != this.oldResetVac ){
        this.form.controls['vacante'].reset()
        this.oldResetVac = this.resetVac
      }
    }
  }

  onVacSelect( val, i ){
    this.changeVac.emit({ val: val, i: i })
    this.selectVacIndex[i] = val
  }

  build( item = this.item ){
    this.successSave = false
    this.saved = false
    this.dataFromUser = false
    this.omitido = false
    this.reingresoFlag = false
    this.difUserFlag = false
    this.oldResetFlag = new Date
    this.oldResetVac = new Date

    this.loading = {}
    this.existingUser = ''
    this.existingUserTmp = ''

    this.newId = undefined
    this.newError = []

    this.form =  new FormGroup({
      ['Nombre_Separado']:    new FormControl(item['Nombres'] ? this.ucwords( item['Nombres'] ) : ''               , [ Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚ]{1}[a-záéíóú]+([ ]{1}([A-ZÁÉÍÓÚ]{1}[a-záéíóú]+|[d]{1}[e]{1}[l]{0,1})){0,3}$')], this.nameExists.bind(this) ),
      ['Apellidos_Separado']: new FormControl(item['Apellidos'] ? this.ucwords( item['Apellidos'] ) : ''           , [ Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+([ ]{1}[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+|[ ]{1}[a-záéíóúñ]{2,3}){0,5}$')], this.nameExists.bind(this) ),
      ['N Corto']:            new FormControl(item['Nombre Corto'] ? this.ucwords( item['Nombre Corto'], false) : '' , [ Validators.required, Validators.pattern('^[A-Z]{1}[a-z]* [A-Z]{1}[a-z]*$') ], this.userExists.bind(this) ),
      ['num_colaborador']:    new FormControl(item['Numero Colaborador'] ? String(item['Numero Colaborador']).trim() : ''  , [ Validators.required, Validators.pattern('^[0-9]*$')  ] ),
      ['Usuario']:            new FormControl(item['Usuario'] ? String(item['Usuario']).trim() : ''                          , [Validators.required, Validators.pattern('^[\\w\\.]*$') ]),
      ['Ingreso']:            new FormControl(item['Fecha Ingreso'] ? this.xlsToMoment(String(item['Fecha Ingreso']).trim()) : ''            , [ Validators.required, Validators.pattern('^[2]{1}[0]{1}[0-2]{1}[0-9]{1}[/]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[/]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$') ] ),
      ['Fecha_Nacimiento']:   new FormControl(item['Fecha Nacimiento'] ? this.xlsToMoment(String(item['Fecha Nacimiento']).trim()) : ''      , [ Validators.required, Validators.pattern('^(([1]{1}[9]{1}[4-9]{1}[0-9]{1})||([2]{1}[0]{1}[0-2]{1}[0-9]{1}))[/]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[/]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})') ] ),
      ['Telefono1']:          new FormControl(item['Telefono'] ? String(item['Telefono']).trim() : ''                      , [ Validators.pattern('^[0-9]+$') ] ),
      ['Telefono2']:          new FormControl(item['Movil'] ? String(item['Movil']).trim() : ''                            , [ Validators.pattern('^[0-9]+$') ] ),
      ['correo_personal']:    new FormControl(item['Correo Personal'] ? item['Correo Personal'].trim() : ''        , [ Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) ] ),
      ['Vigencia_Pasaporte']: new FormControl(item['Pasaporte'] ? this.xlsToMoment(String(item['Pasaporte']).trim()) : ''  , [ Validators.pattern('^[2]{1}[0]{1}[0-2]{1}[0-9]{1}[/]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[/]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})') ] ),
      ['Vigencia_Visa']:      new FormControl(item['Visa'] ? this.xlsToMoment(String(item['Visa']).trim()) : ''  , [ Validators.pattern('^[2]{1}[0]{1}[0-2]{1}[0-9]{1}[/]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[/]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})') ] ),
      ['Pais']:               new FormControl(item['Pais'] ? item['Pais'].trim() : ''                              , [ Validators.required  ] ),
      contrato:               new FormControl(!item['Contrato'] ? '' : item['Contrato'].trim() == 'Temporal' ? 1 : 2    , [ Validators.required  ] ),
      profile:                new FormControl('', [ Validators.required  ] ),
      vacante:                new FormControl('', [ Validators.required  ] ),
      fin_contrato:           new FormControl(''   , [ ] ),
    })

    if( this.form.controls['contrato'].value == 1 ){
      this.setContrato( 1, item['Fin Contrato'] ? moment(item['Fin Contrato'].trim(), 'YYYY/MM/DD').format('YYYY/MM/DD') : '' )
    }

    setTimeout( () => this.resetDates( item, {'Pasaporte':'Vigencia_Pasaporte', 'Visa':'Vigencia_Visa', 'Fecha Nacimiento':'Fecha_Nacimiento', 'Fecha Ingreso':'Ingreso', 'Fin Contrato':'fin_contrato'}), 1000)

  }

  resetDates( item, arr ){
    // tslint:disable-next-line:forin
    for(let t in arr){
      if( !item[t] ){
        this.form.controls[arr[t]].reset()
      }else{
      }
    }
  }

  xlsToMoment(date) {
    return moment(Math.round((date - 25569)*86400*1000)).add(1, 'days').format('YYYY-MM-DD')
  }

  userExists( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this
    let flag:boolean = false

    let promesa = new Promise(
      (resolve, reject) =>{

        if( thisData.reingresoFlag ){

          if( !thisData.difUserFlag ){

            if( thisData.existingUser['N Corto'] != control.value ){
              resolve( {different: true})
              return promesa
            }else{
              resolve(null)
              return promesa
            }

          }else{
            if( thisData.existingUser['N Corto'] == control.value ){
              resolve(null)
              return promesa
            }
          }
        }

        let params = {
          val: control.value,
          compare: 'N Corto'
        }

        thisData._api.restfulPut( params, 'Headcount/nameExists')
          .subscribe( res => {

            this.existingUserTmp = res['detalle']

            if( parseInt(res['data']) > 0 ){
              resolve({existe: true})
            }else{
              resolve(null)
            }
           })



      }
    )
    return promesa
  }

  nameExists( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this

    let promesa = new Promise(
      (resolve, reject) =>{

        if( thisData.form.controls['Nombre_Separado'] && thisData.form.controls['Apellidos_Separado'] ){
          let params = {
            val: `${ thisData.form.controls['Nombre_Separado'].value } ${ thisData.form.controls['Apellidos_Separado'].value }`,
            compare: 'Nombre'
          }

          thisData._api.restfulPut( params, 'Headcount/nameExists')
            .subscribe( res => {

              this.existingUser = res['detalle']

              if( parseInt(res['data']) > 0 ){

                if( moment(thisData.form.controls['Ingreso'].value).format('YYYY-MM-DD') == moment( res['detalle']['Ingreso'] ).format('YYYY-MM-DD') ){
                  resolve({same: true})
                  return promesa
                }
                if( moment(thisData.form.controls['Ingreso'].value).format('YYYY-MM-DD') > moment( res['detalle']['Egreso'] ).format('YYYY-MM-DD') ){
                  resolve( this.reingresoFlag ? null : {reingreso: true})
                  return promesa
                }else{
                  resolve({same: true})
                  return promesa
                }

              }else{
                resolve(null)
              }

            }, err => {
              resolve({db: true})
            })
        }else{
          resolve(null)
        }
      }
    )
    return promesa
  }

  ucwords( st, accents = true, trim = true ) {
    let str = st.toLowerCase()
    let result = str.replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g,
      function(s){
        return s.toUpperCase()
    })

    if( trim ){
      result = result.trim()
      result = result.replace(/[\s]+/g, ' ')
    }

    if( !accents ){
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    return result
  }

  setVal( val, control, el? ){
    if( !val || val == '' ){
      setTimeout( () => this.form.controls[control].reset(), 500 )
    }else{
      this.form.controls[control].setValue( val.format('YYYY/MM/DD') )
    }
    if( control == 'Ingreso' ){
      this.form.controls['vacante'].reset()
      this.changeVac.emit({ val: '', i: this.i })
      this.selectVacIndex[this.i] = val
    }
  }

  setContrato( val, fin? ){
    let validators = []

    if( fin ){
      this.setVal( fin, 'fin_contrato' )
    }else{
      setTimeout( () => this.form.controls['fin_contrato'].reset(), 500 )
    }

    if( val == 1 ){
      validators = [ Validators.required, Validators.pattern('^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[/]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[/]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})') ]
    }

    this.form.controls['fin_contrato'].setValidators( validators )
    this.form.controls['fin_contrato'].updateValueAndValidity()
  }

  validateDateIn( dateIn, dateVac ){
    if( moment(dateIn) >= moment(dateVac) ){
      return true
    }else{
      return false
    }
  }

  test(){
    console.log(this.form.controls)
    console.log(this.existingUser)
  }

  reingreso( username = false ){
    this.test()
  }

  reingresoOk(){
    this.reingresoFlag = true
    this.form.controls['Nombre_Separado'].updateValueAndValidity()
    this.form.controls['Apellidos_Separado'].updateValueAndValidity()
    this.form.controls['N Corto'].updateValueAndValidity()
  }

  validateUser( flag ){
    if( flag ){
      this.form.controls['N Corto'].setValue( this.existingUser['N Corto'] )
      this.form.controls['N Corto'].updateValueAndValidity()
    }else{
      this.difUserFlag = true
      this.form.controls['N Corto'].updateValueAndValidity()
    }
  }

  revalidate( ctrl ){
    this.form.controls[ctrl].updateValueAndValidity()
  }

  submitInfo(){
    if( this.saved || this.form.invalid ){
      this.done.emit( { status: true, index: this.i } )
    }else{

      let params = {
        fields: this.form.value
      }

      let url = 'SolicitudBC/addAsesorV2'
      if( this.reingresoFlag ){
        url = 'SolicitudBC/reIngresoV2'
        params['asesorId'] = this.existingUser['id']
      }

      this._api.restfulPut( params, url )
              .subscribe( res => {

                this.saved = true
                this.successSave = true
                this.newId = res['asesor_id']
                this.done.emit( { status: true, index: this.i, newId: res['asesor_id'] } )

              }, err => {
                console.log('ERROR', err)

                this.saved = true
                this.successSave = false

                let error = err.error
                this.newError = err['error']
                console.error(err.statusText, error.msg)

              })

    }
  }

  review(){
    this.saved = false
    // tslint:disable-next-line:forin
    for( let field in this.form.controls ){
      this.form.controls[field].updateValueAndValidity()
    }
  }

}
