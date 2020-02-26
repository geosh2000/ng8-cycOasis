import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { ApiService } from '../../../services/service.index';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-horarios-semana',
  templateUrl: './horarios-semana.component.html',
  styles: []
})
export class HorariosSemanaComponent implements OnInit {

  @Input() asesor:any
  @Input() asesorName:any
  @Output() horarios = new EventEmitter<any>()

  loading:Object = {}
  horariosData:any
  datesData:any = []
  fdow:any
  comida:boolean = true
  comidaSelect:boolean = true
  nextWeek:number = 1

  showOpts:Object = {
    ch_jornada:   true,
    ch_comida:    true,
    ch_excep:     true,
    ch_excep_p:    false,
    ch_ret:       true,
    ch_sa:        true,
    ch_x:        true,
    ch_pdv:        true,
    ch_x_p:        false,
    sh_p:        true,
    sh_d:        true
  }

  constructor(public _api: ApiService) {
    moment.locale('es');
    this.fdow = moment().subtract(parseInt(moment().format('E'))-1, 'days').format('YYYY-MM-DD')
  }

  getHorarios( start = moment().subtract(parseInt(moment().format('e')), 'days').format('YYYY-MM-DD'), end = moment(moment().subtract(parseInt(moment().format('e')), 'days').format('YYYY-MM-DD')).add(6, 'days').format('YYYY-MM-DD') ){
    this.loading['horarios'] = true

    let params = `0/${start}/${end}/${this.asesor}`
    this._api.restfulGet( params,'Asistencia/pyaV2' )
              .subscribe( res => {

                this.loading['horarios'] = false
                this.horariosData = res['array']['array']
                this.comida = res['array']['comida'] == 0 ? false : true

                let dates:any = []
                for(let i = moment(start); i<=moment(end); i = i.add(1,'days')){
                  dates.push( i.format('YYYY-MM-DD') )
                }

                this.datesData = dates
                // console.log(res.array)
                // console.log(this.datesData)

              }, err => {
                console.log('ERROR', err)
                this.loading['horarios'] = false

                let error = err.error
                this.horarios.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                console.error(err.statusText, error.msg)

              })

            if( parseInt(moment().format('E')) < 4 ){
              this.comidaSelect = true
            }else{
              this.comidaSelect = false
            }

  }

  ngOnChanges(changes: SimpleChanges) {
    this.getHorarios()
  }


  ngOnInit() {
  }

  printTime( date, format, tz = false ){
    if( tz ){
      return moment.tz(date, 'this._zh.defaultZone').tz('America/Bogota').format( format )
    }else{
      return moment(date).format( format )
    }
  }

  addTime( date, number, lapse, format ){
    return moment(date).add(number, lapse).format(format)
  }

  chgComida( event ){
    this.loading['comida'] = true

    let params = {
      asesor: this.asesor,
      comida: event
    }

    this._api.restfulPut( params, 'Asistencia/changeComida' )
            .subscribe( res => {
              this.loading['comida'] = false

            }, err => {
              console.log("ERROR", err)

              this.loading['comida'] = false
              this.comida = !event

              let error = err.error
              this.horarios.emit( {status: false, info: err} )
            })
  }

  nextW( flag ){

    this.nextWeek = flag

    let start, end

    switch( flag ){
      case 0:
        start = moment().subtract(parseInt(moment().format('e')), 'days').subtract(7, 'days').format('YYYY-MM-DD')
        end = moment(moment().subtract(parseInt(moment().format('e')), 'days').subtract(7, 'days').format('YYYY-MM-DD')).add(6, 'days').format('YYYY-MM-DD')
        this.getHorarios( start, end )
        break
      case 1:
        this.getHorarios()
        break
      case 2:
        start = moment().subtract(parseInt(moment().format('e')), 'days').add(7, 'days').format('YYYY-MM-DD')
        end = moment(moment().subtract(parseInt(moment().format('e')), 'days').add(7, 'days').format('YYYY-MM-DD')).add(6, 'days').format('YYYY-MM-DD')
        this.getHorarios( start, end )
        break
    }

  }
}


