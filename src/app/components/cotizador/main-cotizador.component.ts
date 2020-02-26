

import { Component, OnInit, ViewChild } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { CotCreateRsvComponent } from './cot-create-rsv/cot-create-rsv.component';
import { ApiService, InitService } from 'src/app/services/service.index';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;

@Component({
  selector: 'app-main-cotizador',
  templateUrl: './main-cotizador.component.html',
  styles: []
})
export class MainCotizadorComponent implements OnInit {

  @ViewChild(CotCreateRsvComponent, {static: false}) _cot:CotCreateRsvComponent

  products: any = [];
  shownIndex: any = 0;
  dataRsv = {}
  loading:Object = {}
  constructor(private titleService: Title,
              public _api: ApiService,
              public _init: InitService,
              private orderPipe: OrderPipe,
              private sanitization:DomSanitizer,
              public toastr: ToastrService) { }


  ngOnInit() {
    this.titleService.setTitle('CyC - Cotizador');
    this.getServices()
  }

  getServices(){
    this.loading['services'] = true

    this._api.restfulGet( '', 'Rsv/getServices' )
                .subscribe( res => {

                  this.loading['services'] = false;

                  this.products = res['data']

                }, err => {
                  this.loading['services'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  tabChg(e) {
    this.shownIndex = e;
    console.log(e)
  }

  popReserve( h ){
    if(this._init.checkSingleCredential('app_cotizador_rsv')){
      this._cot.popReserve(h)
    }else{
      this.toastr.error('No cuentas con los permisos necesarios para realizar esta acción', 'Permiso Denegado')
    }
  }
}
