import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-sa-badge',
  templateUrl: './sa-badge.component.html',
  styles: []
})
export class SaBadgeComponent implements OnInit {

  @Input() btnWidth:number = 100
  @Input() date:any
  @Input() dataAsesor:Object

  @ViewChild('i',{static:false}) public popover: NgbPopover;

  btnClass:string = ''
  displayText:string = ''

  infoDisplay:boolean = false
  infoExcep:boolean = false
  infoData:Object

  constructor() {

  }

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

          if( data.SalidaAnticipada == 1 ){
            if( data.Aus_id == 15 || data.Aus_id == 16 || data.Aus_id == 8 ){
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
                  this.btnClass     = 'btn-danger'
                  this.displayText  = 'SUS'
                  break
                case 'FJ':
                  this.btnClass     = 'btn-info'
                  this.displayText  = 'FJ'
                  break
              }

              return true
            }

            if( data.tiempoLaborado < 60 ){
              this.btnClass     = 'btn-danger'
              this.displayText  = `SA < 60%`
            }else{
              this.btnClass     = 'btn-warning'
              this.displayText  = `SA > 60%`
            }

            return true

          }

      }

    }

    this.btnClass     = 'btn-light'
    this.displayText  = '_'
    return true

  }

  ngOnInit() {
  }

}
