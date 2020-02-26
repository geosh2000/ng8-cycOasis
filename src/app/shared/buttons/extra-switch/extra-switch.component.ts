import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../services/service.index';

@Component({
  selector: 'app-extra-switch',
  templateUrl: './extra-switch.component.html',
  styles: []
})
export class ExtraSwitchComponent implements OnInit {

  @Input()  pago:any
  @Input()  id:any
  @Input()  tipo:any
  @Input()  code:any
  @Input()  fecha:any

  @Output() save = new EventEmitter<any>()

  payment:boolean = true
  loading:Object = {
    change: false
  }

  constructor( private _api:ApiService ) { }

  ngOnInit() {
    this.payment = parseInt(this.pago) == 1 ? true : false
  }

  chgPayment( event ){
    this.loading['change'] = false

    let params = {
      horario:  this.id,
      fecha:    this.fecha,
      phx:      event
    }

    let rest = 'chgHxPayment'

    if( this.tipo == 'dt' ){
      rest = 'chgDtPayment'
    }

    this._api.restfulPut( params, `Asistencia/${rest}`)
            .subscribe( res => {

              this.loading['change'] = false
              this.save.emit( {status: true, msg: 'Tipo de pago modificado'} )

            }, err => {
              console.log("ERROR", err)
              this.loading['change'] = false

              let error = err.error
              this.save.emit( {status: false, msg: error.msg} )
              this.payment = !event

            })


  }


}
