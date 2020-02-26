import { Component, OnInit, Injectable, ViewChild, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment-timezone';
import { SearchBarCotizadorComponent } from '../search-bar-cotizador/search-bar-cotizador.component';
import { ApiService, InitService } from 'src/app/services/service.index';
import { OrderPipe } from 'ngx-order-pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

declare var jQuery: any;

@Component({
  selector: 'app-cotiza-xtras',
  templateUrl: './cotiza-xtras.component.html',
  styleUrls: ['./cotiza-xtras.component.css']
})
export class CotizaXtrasComponent implements OnInit {

  @ViewChild(SearchBarCotizadorComponent, {static:false}) _search:SearchBarCotizadorComponent
  @Output() rsv = new EventEmitter<any>()

  pickNum:any = []
  adults:any = 1
  min:any = 0
  loading:Object = {}

  inicio: any;
  results:any = []
  occup:Object = {}
  groupsTfa = []
  flag = false

  minDate:NgbDateStruct = {
    day: parseInt(moment().format('DD')),
    month: parseInt(moment().format('MM')),
    year: parseInt(moment().format('YYYY'))
  }

  constructor(public _api: ApiService,
              public _init: InitService,
              private orderPipe: OrderPipe,
              private sanitization:DomSanitizer,
              public toastr: ToastrService) {

  }

  ngOnInit() {
    this.getCodes()
  }

  search( e ){
    this.loading['cotizar'] = true

    this._api.restfulPut( e, 'Cotizador/tourList' )
                .subscribe( res => {

                  this.loading['cotizar'] = false;

                  for( let t of res['data'] ){
                    t['incluye'] = t['incluye'].split('*')
                    t['no_incluye'] = t['no_incluye'].split('*')
                    t['salidaHotel'] = JSON.parse(t['salidaHotel'])
                    t['salidaHora'] = JSON.parse(t['salidaHora'])
                  }

                  this.results = res['data']
                  this.occup = res['occup']
                  this.flag = true

                }, err => {
                  this.loading['cotizar'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatDate(date, format, tz?) {
    if( !tz ){
      return moment(date).format(format);
    }else{
      return moment.tz(date).tz('America/Bogota').format(format);
    }
  }

  popReserve( h ){
    h['adultos'] = this.occup['adultos']
    h['menores'] = this.occup['menores']
    h['infantes'] = this.occup['infantes']
    h['fecha'] = this.occup['fecha']
    this.rsv.emit({
      data: h,
      moneda: this._search.moneda,
      tipo: 'tour'
    })
  }

  getCodes() {

    this.loading['grupos'] = true;


    this._api.restfulGet( '', 'Lists/gruposTarifaXfer' )
                .subscribe( res => {

                  this.loading['grupos'] = false;
                  this.groupsTfa = res['data']

                }, err => {
                  this.loading['grupos'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatSalida( t ){
    let h = Math.floor(t)
    let m = Math.round(t % h * 100)

    // return moment(`${h}:${m}:00`).format('HH:mm')
    return `${h}:${m < 10 ? '0' + m : m}`
  }

}
