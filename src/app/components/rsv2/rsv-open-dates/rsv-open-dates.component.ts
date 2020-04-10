import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-rsv-open-dates',
  templateUrl: './rsv-open-dates.component.html',
  styleUrls: ['./rsv-open-dates.component.css']
})
export class RsvOpenDatesComponent implements OnInit {

  @Output() saveOpen = new EventEmitter()

  item:any
  itemId:any
  startDate:any
  endDate:any
  limitODate:any
  limitTravel:any
  limitTravelD:any
  noches:any
  tipo:any
  mlTicket:any
  selDate:NgbDateStruct
  limitDate:NgbDateStruct

  loading = false

  minDate:NgbDateStruct = {
    day: parseInt(moment().add(1, 'days').format('DD')),
    month: parseInt(moment().add(1, 'days').format('MM')),
    year: parseInt(moment().add(1, 'days').format('YYYY'))
  }

  constructor( private _api:ApiService, private toastr:ToastrService ) { }

  ngOnInit() {
  }

  open( arr, mlt ){
    this.item = arr['itemLocatorId']
    this.itemId = arr['itemId']
    // this.startDate = arr['llegada']
    // this.endDate = arr['salida'] ? arr['salida'] : arr['llegada']
    if( this.selDate ){
      this.endDate = moment({year: this.selDate.year, month: this.selDate.month - 1, day: this.selDate.day}).add(arr['htlNoches'] ? arr['htlNoches'] : 0,'days').format('YYYY-MM-DD');
    }else{
      this.endDate = arr['salida'] ? arr['salida'] : arr['llegada']
    }
    this.noches = arr['htlNoches'] ? arr['htlNoches'] : 0
    this.tipo = arr['itemType']
    this.mlTicket = mlt
    this.minDate = {
      day: parseInt(moment().format('DD')),
      month: parseInt(moment().format('MM')),
      year: parseInt(moment().format('YYYY'))
    }
    jQuery('#openDates').modal('show')
  }

  close(){
    this.item = null
    this.itemId = null
    // this.startDate = null
    this.endDate = null
    this.noches = null
    this.tipo = null
    this.mlTicket = null
    jQuery('#openDates').modal('hide')
  }

  onDateSelection(date: NgbDateStruct, el, t = 'd' ) {
    switch( t ){
      case 'd':
        this.selDate = date
        this.startDate = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        this.endDate = moment({year: date.year, month: date.month - 1, day: date.day}).add(this.noches,'days').format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD')}`);
        el.close();
        break
      case 'l':
        this.limitDate = date
        this.limitODate = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#pickerL').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD')}`);
        el.close();
        break
      case 't':
        this.limitTravel = date
        this.limitTravelD = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#pickerT').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD')}`);
        el.close();
        break
    }
  }

  formatDate( m ){
    return moment(m).format('DD/MM/YYYY')
  }

  saveOpenDates(){
    this.loading = true

    let params = {
      item: this.item,
      mlTicket: this.mlTicket,
      tipo: this.tipo,
      dates: { inicio: this.startDate, fin: this.endDate },
      itemId: this.itemId,
      limit: this.limitODate,
      limitTravel: this.limitTravelD
    }

    this._api.restfulPut( params, 'Rsv/setOpen' )
                .subscribe( res => {

                  this.loading = false;
                  this.saveOpen.emit(true)
                  this.close()

                }, err => {
                  this.loading = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
