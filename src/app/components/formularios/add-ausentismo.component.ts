import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PopoverModule } from 'ngx-popover';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

import * as Globals from '../../globals';
declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-add-ausentismo',
  templateUrl: './add-ausentismo.component.html',
  styles: []
})
export class AddAusentismoComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ,{static:false}) private picker: DaterangePickerComponent

  @Output() notif = new EventEmitter<any>()

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  loading:boolean = false
  loaded:boolean = false

  tiposAus:any
  diasPendientes:any = []
  existentAus:boolean = false
  motivoSelected:any
  daySelect:any
  restSelect:any
  maxDays:any

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    ranges: {
               'Today': [moment(), moment()]
            }
  }

  formAddAusentismo:FormGroup;

  constructor(private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                private _init:InitService
                ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._dateRangeOptions.settings = {
      autoUpdateInput: true,
      locale: { format: "YYYY-MM-DD" }
    }


    this.formAddAusentismo = new FormGroup({
      inicio:             new FormControl('', [ Validators.required,  Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
      fin:                new FormControl('', [ Validators.required,  Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
      tipo:               new FormControl('', [ Validators.required ]),
      dias:               new FormControl('', [ Validators.required ]),
      descansos:          new FormControl('', [ Validators.required ]),
      caso:               new FormControl('', [ Validators.required, Validators.pattern("^[0-9]{6,7}$") ] ),
      notas:              new FormControl('', [ Validators.required ]),
      motivo:             new FormControl('', [ Validators.required ]),
      asesor:             new FormControl('', [ Validators.required ] )
    })

    // Cambio en Dias - Fin
    this.formAddAusentismo.controls['dias'].valueChanges.subscribe( res => {
      if( this.formAddAusentismo.controls['dias'].valid){
        this.setEnd()
      }
    });
    // Cambio en descansos - Fin
    this.formAddAusentismo.controls['descansos'].valueChanges.subscribe( res => {
      if( this.formAddAusentismo.controls['descansos'].valid){
        this.setEnd()
      }
    });
    // Cambio en inicio - Fin
    this.formAddAusentismo.controls['inicio'].valueChanges.subscribe( res => {
      if( this.formAddAusentismo.controls['inicio'].valid){
        this.setEnd()
      }
    });
  }

  ngOnInit() {
  }

  setEnd(){
    let inicio  = moment(this.formAddAusentismo.controls['inicio'].value)
    let total   = parseInt(this.formAddAusentismo.controls['dias'].value) + parseInt(this.formAddAusentismo.controls['descansos'].value) - 1
    let fin     = moment(inicio).add(total, 'days').format("YYYY-MM-DD")

    this.formAddAusentismo.controls['fin'].setValue( fin )
  }

  setVal( date, param){
    this.formAddAusentismo.controls[param].setValue(date.format('YYYY-MM-DD'))
  }

  submit(){
    this._api.restfulPut( this.formAddAusentismo.value, 'asistencia/setAusentismo' )
            .subscribe( res => {
                          console.log( res )
                        },
                        err => {
                          let errores = JSON.parse( err._body )

                          this.notif.emit( { msg: errores.msg, title: err.statusText} )
                          for(let errors in errores.errores){
                            this.notif.emit( { msg: errores.errores[errors], title: errors} )
                          }

                        })
  }

  getTipos( asesor ){
    this._api.restfulGet( `${asesor}`,'Asistencia/tipos' )
            .subscribe( res => {
              this.tiposAus = res['tipos']
              this.diasPendientes = res['pending']
              // console.log(this.diasPendientes)
            })
  }


  initForm( asesor, fecha ){

    jQuery('#confirmDelete').collapse('hide')

    this.loaded = false
    this.existentAus = false
    this.motivoSelected = null
    let existentAus

    this.getTipos( asesor )

    this._api.restfulGet( `${asesor}/${fecha}`, 'Asistencia/ausPorAsesor' )
            .subscribe( res => {
              if(res!=0){
                existentAus         = res
                this.motivoSelected = res['motivo']
                this.existentAus    = true
              }else{
                existentAus = {
                  tipo_ausentismo:  '',
                  dias:             1,
                  Inicio:           moment(fecha).format('YYYY-MM-DD'),
                  Fin:              moment(fecha).format('YYYY-MM-DD'),
                  Descansos:        0,
                  Beneficios:       0,
                  caso:             '',
                  Comments:         '',
                  motivo:           ''
                }
              }

              this.formAddAusentismo.controls['tipo'].      setValue( existentAus['tipo_ausentismo'] )
              this.formAddAusentismo.controls['dias'].      setValue( existentAus['dias'] )
              this.formAddAusentismo.controls['descansos']. setValue( existentAus['Descansos'] )
              this.formAddAusentismo.controls['inicio'].    setValue( existentAus['Inicio'] )
              this.formAddAusentismo.controls['fin'].       setValue( existentAus['Fin'] )
              this.formAddAusentismo.controls['caso'].      setValue( existentAus['caso'] )
              this.formAddAusentismo.controls['notas'].     setValue( existentAus['Comments'] )
              this.formAddAusentismo.controls['motivo'].    setValue( existentAus['motivo'] )
              this.formAddAusentismo.controls['asesor'].    setValue( asesor )
              this.loaded = true
            })
  }

  assignDays( event ){
    this.maxDays = event.target.selectedOptions[0].attributes['days'].value
    this.formAddAusentismo.controls['dias'].setValue(1)
  }

}
