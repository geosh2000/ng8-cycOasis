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
    return '...' + t.substring(t.length - 8, t.length)
  }


}
