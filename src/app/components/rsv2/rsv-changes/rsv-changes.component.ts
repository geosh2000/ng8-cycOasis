import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ApiService } from '../../../services/api.service'

@Component({
  selector: 'app-rsv-changes',
  templateUrl: './rsv-changes.component.html',
  styleUrls: ['./rsv-changes.component.css']
})
export class RsvChangesComponent implements OnInit {

  @Output() saveOpen = new EventEmitter()

  i:Object = {}
  original:Object = {}
  hotelList:Object = {}
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
  nights:any
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

    // SET ORIGINAL DATA
    this.original = JSON.parse(JSON.stringify(arr))
    this.i = arr
    this.item = arr['itemLocatorId']
    this.itemId = arr['itemId']
    
    // this.selDate = arr['llegada']
    if( this.selDate ){
      this.i['salida'] = moment({year: this.selDate.year, month: this.selDate.month - 1, day: this.selDate.day}).add(this.i['htlNoches'] ? this.i['htlNoches']: 0,'days').format('YYYY-MM-DD');
    }else{
      this.i['salida'] = arr['salida'] ? arr['salida'] : arr['llegada']
    }

    this.tipo = arr['itemType']
    this.mlTicket = mlt
    this.minDate = {
      day: parseInt(moment().format('DD')),
      month: parseInt(moment().format('MM')),
      year: parseInt(moment().format('YYYY'))
    }
    jQuery('#changeItem').modal('show')
    jQuery('#picker').val(this.i['llegada'])

    this.getHotelList()
  }

  close(){
    this.i = {}
    this.item = null
    this.itemId = null
    // this.i['llegada'] = null
    this.i['salida'] = null
    this.noches = null
    this.tipo = null
    this.mlTicket = null
    jQuery('#changeItem').modal('hide')
  }

  onDateSelection(date: NgbDateStruct, el, t = 'd' ) {
    switch( t ){
      case 'd':
        this.selDate = date
        this.i['llegada'] = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        this.i['salida'] = moment({year: date.year, month: date.month - 1, day: date.day}).add(this.i['htlNoches'],'days').format('YYYY-MM-DD');
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

  addNights( f ){
    if( f ){
      this.i['htlNoches']++
    }else{
      if( this.i['htlNoches'] > 1 ){
        this.i['htlNoches']--
      }else{
        this.i['htlNoches'] == 1
      }
    }

    this.chgNights( this.i['htlNoches'] )
  }

  addPax( i, f ){
    if( f ){
      this.i[i]++
    }else{
      if( this.i[i] > 0 ){
        this.i[i]--
      }else{
        this.i[i] == 0
      }
    }

  }

  chgNights( i ){
    this.i['salida'] = moment(this.i['llegada']).add(i,'days').format('YYYY-MM-DD');
  }

  saveChanges(){
    this.loading = true

    let mdfFields = [
      ['llegada','inicio'],
      ['salida','fin'],
      ['htlNoches','noches'],
      ['adultos','adultos'],
      ['juniors','juniors'],
      ['menores','menores'],
      ['hotel','hotel'],
      ['categoria','categoria'],
    ]

    let chgs = []
    let fields = ''
    let newData = {}
    let oldData = {}
    let msgOld = 'Antes: '
    let msgNew = 'Ahora: '

    for( let f of mdfFields ){
      if( this.original[f[0]] != this.i[f[0]] ){
        chgs.push(f[0])
        fields += `, ${f[0]}`
        newData[f[1]] = this.i[f[0]]
        oldData[f[0]] = this.original[f[0]]
        msgOld += `, ${f[0]}: ${this.original[f[0]]}`
        msgNew += `, ${f[0]}: ${this.i[f[0]]}`
      }
    }

    if( chgs.length == 0 ){
      this.toastr.error('No cambios', 'No se detectaron cambios')
      this.loading = false
      return true
    }

    let params = {
      newData,
      oldData,
      itemId: this.original['itemId'],
      item: this.original['itemLocatorId'],
      mlTicket: this.original['mlTicket'],
      msg: `Cambios aplicados. ${msgOld} ||${msgNew} por: `
    }

    this._api.restfulPut( params, 'Rsv/setChanges' )
                .subscribe( res => {

                  this.loading = false;
                  this.saveOpen.emit(true)
                  this.toastr.success('Cambios detectados', `Se detectaron ${chgs.length} cambios... ${fields}`)
                  this.close()

                }, err => {
                  this.loading = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getHotelList(){
    
    this._api.restfulGet( '', 'Lists/habsListCode' )
                .subscribe( res => {

                  let htls = {}

                  for( let r of res['data'] ) {
                    if( htls[r['code']] ){
                      htls[r['code']].push(r)
                    }else{
                      htls[r['code']] = [r]
                    }
                  }

                  this.hotelList = htls

                }, err => {

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}

