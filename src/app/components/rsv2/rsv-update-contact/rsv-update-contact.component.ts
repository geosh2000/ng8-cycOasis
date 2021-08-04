import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import { ApiService } from '../../../services/api.service';
import { SearchZdUserComponent } from '../../../shared/search-zd-user/search-zd-user.component';

@Component({
  selector: 'app-rsv-update-contact',
  templateUrl: './rsv-update-contact.component.html',
  styleUrls: ['./rsv-update-contact.component.css']
})
export class RsvUpdateContactComponent implements OnInit {

  @Output() saved = new EventEmitter()
  @ViewChild( SearchZdUserComponent, {static: false}) _search:SearchZdUserComponent

  loading = false
  mlId:any
  mlInfo:any
  flagDif = false
  newData:any

  customMsgFlag = false
  customMsg = ''

  constructor( private _api:ApiService, private toastr:ToastrService ) { }

  ngOnInit() {
  }

  open( ml, customMsg = false, msg='' ){

    this.customMsgFlag = customMsg
    this.customMsg = msg

    this._search.data = []
    this._search.showSearch = false
    this.newData = {}
    this.flagDif = false
    this.mlInfo = ml
    this.mlId = ml['masterlocatorid']
    this._search.searchById( ml['zdUserId'] )
    jQuery('#updateUser').modal('show')
  }

  close(){
    this.newData = {}
    this.flagDif = false
    this.mlInfo = null
    this.mlId = null
    jQuery('#updateUser').modal('hide')
  }

  updateClient( e ){

    this.loading = true

    let compare = {
      nombreCliente: e['name'],
      telCliente: e['phone'],
      waCliente: e['user_fields']['whatsapp'],
      correoCliente: e['email'],
      languaje: e['user_fields']['idioma_cliente'],
      zdUserId: e['id'],
      esNacional: e['user_fields']['nacionalidad'] == null ? null : (e['user_fields']['nacionalidad'] == 'nacional' ? '1' : '2')
    }
    let flag = false

    for( let f in compare ){
      if( this.mlInfo[f] != compare[f] ){
        flag = true
      }
    }

    this.flagDif = !flag

    if( flag ){
      jQuery('#updateUser').modal('hide')
      this.updateUser( this.mlId, compare )
    }

    this.loading = false

  }

  updateUser( ml, compare ){
    this.loading = true
    this.mlId = ml

    this._api.restfulPut( {masterlocatorid: ml, update: compare}, 'Calls/updateMlUser' )
                .subscribe( res => {

                  this.loading = false;
                  this.toastr.success('Usuario actualizado correctamente', 'ACTUALIZADO')
                  this.close()
                  this.saved.emit( res['data'] )

                }, err => {
                  this.loading = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
