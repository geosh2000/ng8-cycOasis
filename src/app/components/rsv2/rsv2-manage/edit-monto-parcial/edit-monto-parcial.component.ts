import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import * as moment from 'moment-timezone';
import * as Globals from '../../../../globals';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';
import { UploadImageComponent } from 'src/app/components/formularios/upload-image.component';

@Component({
  selector: 'app-edit-monto-parcial',
  templateUrl: './edit-monto-parcial.component.html',
  styleUrls: ['./edit-monto-parcial.component.css']
})
export class EditMontoParcialComponent implements OnInit {

  @Input() i:Object = {}
  @Output() saveMonto = new EventEmitter()
  @Output() saveName = new EventEmitter()
  @Output() uplImg = new EventEmitter()
  @Output() reload = new EventEmitter()
  @Output() confSent = new EventEmitter()
  @Output() openDates = new EventEmitter()

  loading:Object = {}
  hrIndex = Globals.HREF
  editNameFlag = false
  name = {
    name_1: '',
    lname_1: '',
    name_2: '',
    lname_2: '',
    name_3: '',
    lname_3: '',
    name_4: '',
    lname_4: '',
    name_5: '',
    lname_5: ''
  }

  constructor(public _api: ApiService,
              public _init: InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  formatDate( d, f ){
    return moment(d).format(f)
  }

  saveMontoFnc( e ){
    this.saveMonto.emit(e)
  }

  editName(n, i){
    if( n.value == ''){
      this.toastr.error('El nombre no puede estar vacío', 'Error!')
      return false
    }

    this.loading['editName'] = true

    let params = {
      name: n.value,
      item: i
    }

    this._api.restfulPut( params, 'Rsv/editName' )
                .subscribe( res => {

                  this.loading['editName'] = false;
                  this.i['nombreCliente'] = params['name']
                  this.saveName.emit( {itemId: this.i['itemId'], nombre: params['name']} )
                  this.editNameFlag = false

                }, err => {
                  this.loading['editName'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }
  
  editNameV2(n, i){

    this.loading['editName'] = true

    if( n['name_1'] == '' || n['lname_1'].value == '' ){
      this.toastr.error('El nombre no puede estar vacío', 'Error!')
      return false
    }

    let x=1;
    let map = {
      1: 'htl_nombre_1',
      2: 'htl_apellido_1',
      3: 'htl_nombre_2',
      4: 'htl_apellido_2',
      5: 'htl_nombre_3',
      6: 'htl_apellido_3',
      7: 'htl_nombre_4',
      8: 'htl_apellido_4',
      9: 'htl_nombre_5',
      10: 'htl_apellido_5'
    }
    let names = {
      htl_nombre_1:   n['name_1']   != null ? (n['name_1'].trim()  ==  '' ? null : n['name_1'].trim())  : null,
      htl_apellido_1: n['lname_1']  != null ? (n['lname_1'].trim() ==  '' ? null : n['lname_1'].trim()) : null,
      htl_nombre_2:   n['name_2']   != null ? (n['name_2'].trim()  ==  '' ? null : n['name_2'].trim())  : null,
      htl_apellido_2: n['lname_2']  != null ? (n['lname_2'].trim() ==  '' ? null : n['lname_2'].trim()) : null,
      htl_nombre_3:   n['name_3']   != null ? (n['name_3'].trim()  ==  '' ? null : n['name_3'].trim())  : null,
      htl_apellido_3: n['lname_3']  != null ? (n['lname_3'].trim() ==  '' ? null : n['lname_3'].trim()) : null,
      htl_nombre_4:   n['name_4']   != null ? (n['name_4'].trim()  ==  '' ? null : n['name_4'].trim())  : null,
      htl_apellido_4: n['lname_4']  != null ? (n['lname_4'].trim() ==  '' ? null : n['lname_4'].trim()) : null,
      htl_nombre_5:   n['name_5']   != null ? (n['name_5'].trim()  ==  '' ? null : n['name_5'].trim())  : null,
      htl_apellido_5: n['lname_5']  != null ? (n['lname_5'].trim() ==  '' ? null : n['lname_5'].trim()) : null,
    }


    
    let params = {
      names: names,
      item: i
    }

    this._api.restfulPut( params, 'Rsv/editNameV2' )
                .subscribe( res => {

                  this.loading['editName'] = false;
                  this.i['nombreCliente'] = params['names']['htl_nombre_1']+' '+params['names']['htl_apellido_1']
                  this.i['huesped1'] = params['names']['htl_nombre_1']+' '+params['names']['htl_apellido_1']
                  this.i['huesped2'] = params['names']['htl_nombre_2'] == null ? null : params['names']['htl_nombre_2']+' '+params['names']['htl_apellido_2']
                  this.i['huesped3'] = params['names']['htl_nombre_3'] == null ? null : params['names']['htl_nombre_3']+' '+params['names']['htl_apellido_3']
                  this.i['huesped4'] = params['names']['htl_nombre_4'] == null ? null : params['names']['htl_nombre_4']+' '+params['names']['htl_apellido_4']
                  this.i['huesped5'] = params['names']['htl_nombre_5'] == null ? null : params['names']['htl_nombre_5']+' '+params['names']['htl_apellido_5']
                  this.i['htl_nombre_1'] = params['names']['htl_nombre_1']
                  this.i['htl_apellido_1'] = params['names']['htl_apellido_1']
                  this.i['htl_nombre_2'] = params['names']['htl_nombre_2']
                  this.i['htl_apellido_2'] = params['names']['htl_apellido_2']
                  this.i['htl_nombre_3'] = params['names']['htl_nombre_3']
                  this.i['htl_apellido_3'] = params['names']['htl_apellido_3']
                  this.i['htl_nombre_4'] = params['names']['htl_nombre_4']
                  this.i['htl_apellido_4'] = params['names']['htl_apellido_4']
                  this.i['htl_nombre_5'] = params['names']['htl_nombre_5']
                  this.i['htl_apellido_5'] = params['names']['htl_apellido_5']
                  this.saveName.emit( {itemId: this.i['itemId'], nombre: params['names']['htl_nombre_1']+' '+params['names']['htl_apellido_1']} )
                  this.editNameFlag = false

                }, err => {
                  this.loading['editName'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  calcPax( a, b, c ){

      return parseInt(a) + parseInt(b) + parseInt(c)

  }

  editNameOpen( i ){
    this.editNameFlag = true
    this.name = {
      name_1: i['htl_nombre_1'],
      lname_1: i['htl_apellido_1'],
      name_2: i['htl_nombre_2'],
      lname_2: i['htl_apellido_2'],
      name_3: i['htl_nombre_3'],
      lname_3: i['htl_apellido_3'],
      name_4: i['htl_nombre_4'],
      lname_4: i['htl_apellido_4'],
      name_5: i['htl_nombre_5'],
      lname_5: i['htl_apellido_5']
    }
  }

  editNameClose(){
    this.editNameFlag = false
    this.name = {
      name_1: '',
      lname_1: '',
      name_2: '',
      lname_2: '',
      name_3: '',
      lname_3: '',
      name_4: '',
      lname_4: '',
      name_5: '',
      lname_5: '',
    }
  }

  sendConf( l ){

    this.loading['sendConf'] = true;
    let lang = l ? 1 : 0

    this._api.restfulGet( `${this.i['itemLocatorId']}/${lang}`, 'Rsv/sendConf' )
                .subscribe( res => {

                  this.loading['sendConf'] = false;
                  this.confSent.emit( true )

                }, err => {
                  this.loading['sendConf'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });

  }

  copyToClipboard( t ) {

    let d = $('<input>').val(t).appendTo('body').select()
    document.execCommand('copy')

  }

  linkPrint( t ){
    if( t.length > 11 ){
      return '...' + t.substring(t.length - 8, t.length)
    }else{
      return t
    }
  }

  getVoucherLink( ref, t ){

    switch(t){
      case 'link':
        let r = ref.substr(0,ref.indexOf('('))
        let i = ref.substr(ref.length - 1,1)

        if( i == 1 ){
          return this._api.extTokenLink( 'https://cyc-oasishoteles.com/voucherPreview/view.php', {ref: r} )
        }

        return this.hrIndex + '/vouchers/' + this.i['itemLocatorId']
      case 'text':
        return ref.substr(0,ref.length - 1)
    }
  }

  verifyLink( i ){
    i['loading'] = true;

    this._api.restfulPut( {reference: i['reference']}, 'Paypal/searchInvoice' )
                .subscribe( res => {

                  i['loading'] = false;
                  console.log(res['data'])

                  let item = res['data']['items'][0]

                  if( item['status'] != 'PAID' ){
                    this.toastr.error('El formato no se a pagado por completo', item['status'])
                    return false
                  }else{
                    this.toastr.success('El formato ha sido pagado', item['status'])
                    return false
                  }



                }, err => {
                  i['loading'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
