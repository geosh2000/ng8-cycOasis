import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-puntualidad-badge',
  templateUrl: './puntualidad-badge.component.html',
  styles: []
})
export class PuntualidadBadgeComponent implements OnInit {

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

          if( data.Retardo != null ){
            this.infoDisplay = true
            this.infoExcep = true
            this.infoData = {
              code:   data.RT_Codigo,
              excep:  data.Retardo,
              nota:   data.RT_Nota,
              caso:   data.RT_caso,
              reg:    data.RT_register,
              lu:     data['RT_LU']
            }

            if( data.RT_Codigo != null ){
              this.infoData['excep'] = data.RT_Codigo
            }

            switch( this.infoData['excep'] ){
              case 'RT-A':
                this.btnClass     = 'btn-warning'
                this.displayText  = 'RT-A'
                break
              case 'RT-B':
                this.btnClass     = 'btn-danger'
                this.displayText  = 'RT-B'
                break
              case 'RJ':
                this.btnClass     = 'btn-info'
                this.displayText  = 'RT-J'
                break
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
