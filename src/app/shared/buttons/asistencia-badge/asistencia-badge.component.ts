import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-asistencia-badge',
  templateUrl: './asistencia-badge.component.html',
  styles: [`.btn-morado { background: indigo; color: white }`]
})
export class AsistenciaBadgeComponent implements OnInit {

  @Input() btnWidth:number = 100
  @Input() date:any
  @Input() dataAsesor:Object

  // @ViewChild('i') public popover: NgbPopover;
  @ViewChild('i',{static:false}) public popover: NgbPopover;

  btnClass:string = ''
  displayText:string = ''

  infoDisplay:boolean = false
  infoExcep:boolean = false
  infoData:Object

  constructor() {

  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges(changes: SimpleChanges) {

    if(this.dataAsesor){
      this.build( this.dataAsesor )
    }

  }

  displayInfo(): void{
    const isOpen = this.popover.isOpen();
    if(this.infoDisplay){
      if( this.popover.isOpen() ){
        this.popover.close()
      }else{
        this.popover.open()
      }
    }
  }

  build( data ){

    this.infoDisplay = false
    this.infoExcep = false

    if( data.j_login!=null ){

      if( data.Descanso!=1 ){

          if(data.SalidaAnticipada!=1){
            if( data.Ausentismo==1 ){
              this.infoDisplay = true
              this.infoExcep = true
              this.infoData = {
                code:   data.Code_aus,
                excep:  data.Aus_Nombre,
                nota:   data.Aus_Nota,
                caso:   data.Aus_caso,
                reg:    data.Aus_Register,
                lu:     data.Aus_LU
              }

              switch( data.Code_aus){
                case 'F':
                  this.btnClass     = 'btn-danger'
                  this.displayText  = data.Code_aus
                  return
                case 'SUS':
                  this.btnClass     = 'btn-morado'
                  this.displayText  = data.Code_aus
                  return
                default:
                  this.btnClass     = 'btn-morado'
                  this.displayText  = data.Code_aus
                  return
              }

            }else{
              this.btnClass     = 'btn-success'
              this.displayText  = 'A'
              return
            }

          }else{

            if( data.Aus_id != null ){
              this.infoDisplay = true
              this.infoExcep = true
              this.infoData = {
                code:   data.Code_aus,
                excep:  data.Aus_Nombre,
                nota:   data.Aus_Nota,
                caso:   data.Aus_caso,
                reg:    data.Aus_Register,
                lu:     data.Aus_LU
              }

              switch( this.infoData['code'] ){
                case 'F':
                  this.btnClass     = 'btn-danger'
                  this.displayText  = 'F'
                  break
                case 'SUS':
                  this.btnClass     = 'btn-morado'
                  this.displayText  = 'SUS'
                  break
                case 'FJ':
                  this.btnClass     = 'btn-morado'
                  this.displayText  = 'FJ'
                  break
                default:
                  this.btnClass     = 'btn-morado'
                  this.displayText  = this.infoData['code']
                  break
              }

              return true
            }

            if( data.tiempoLaborado>=60 ){
              this.btnClass     = 'btn-success'
              this.displayText  = 'A'
              return
            }else{
              this.infoDisplay = true
              this.infoExcep = true
              if( data.RT_Codigo == 'SA' ){
                this.infoData = {
                  code:   data.RT_Codigo,
                  excep:  data.RT_Excepcion,
                  nota:   data.RT_Nota,
                  caso:   data.RT_caso,
                  reg:    data.RT_register,
                  lu:     data.RT_LU
                }
              }else{
                this.infoData = {
                  code:   'SA',
                  excep:  'Salida Anticipada',
                  nota:   `Jornada menor al 60% -> (${ parseFloat(data.tiempoLaborado).toFixed(2) }%)`,
                  caso:   '',
                  reg:    'Calculado por sistema',
                  lu:     ''
                }
              }

              this.btnClass     = 'btn-danger'
              this.displayText  = 'F'
              return
            }

          }


        }

      if( data.Descanso==1 ){

        if( data.Code_aus == 'DT' ){
          this.btnClass     = 'btn-warning'
          this.displayText  = 'DT'
          return
        }else{
          this.btnClass     = 'btn-secondary'
          this.displayText  = 'D'
          return
        }

      }
    }

    if( data.Asistencia!=1 || (data.SalidaAnticipada==1 && data.tiempoLaborado<60) ){

      if( data.Ausentismo==1 ){

        this.infoDisplay = true
        this.infoExcep = true
        this.infoData = {
          code:   data.Code_aus,
          excep:  data.Aus_Nombre,
          nota:   data.Aus_Nota,
          caso:   data.Aus_caso,
          reg:    data.Aus_Register,
          lu:     data.Aus_LU
        }

        if( data.Code_aus == 'DT'){
          this.btnClass     = 'btn-warning'
          this.displayText  = 'D'
          return
        }else{
          this.btnClass     = 'btn-morado'
          this.displayText  = data.Code_aus
          return
        }

      }

      if( data.Ausentismo!=1 ){

        if( data.Descanso!=1 ){

          let header = moment(this.date)
          let today = moment()
          let td = moment( today.format('YYYY-MM-DD') )

          if(header >= td){
            this.btnClass     = 'btn-outline-secondary'
            this.displayText  = '_'
            return
          }else{

            if( data.RT_Codigo != null ){
              this.infoDisplay = true
              this.infoExcep = true
              this.infoData = {
                code:   data.RT_Codigo,
                excep:  data.RT_Excepcion,
                nota:   data.RT_Nota,
                caso:   data.RT_caso,
                reg:    data.RT_register,
                lu:     data.RT_LU
              }
            }

            this.btnClass     = 'btn-danger'
            this.displayText  = 'F'
            return
          }

        }

        if( data.Descanso==1 ){
          this.btnClass     = 'btn-secondary'
          this.displayText  = 'D'
          return
        }
      }

    }else{
      this.btnClass     = 'btn-secondary'
      this.displayText  = '_'
      return
    }
  }

  ngOnInit() {
  }

}
