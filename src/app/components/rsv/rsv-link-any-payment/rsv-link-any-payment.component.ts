import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rsv-link-any-payment',
  templateUrl: './rsv-link-any-payment.component.html',
  styles: []
})
export class RsvLinkAnyPaymentComponent implements OnInit {

  @Output() linked = new EventEmitter<any>()

  loading = {}
  ml:any
  op:any
  pid:any

  params:Object = {}
  genData:Object = {}

  constructor(public _api: ApiService,
              public _init: InitService,
              public toastr: ToastrService ) { }

  ngOnInit() {
  }

  closeModal( reload = false ){
    this.op = null
    this.ml = null
    this.pid = null
    // this.close.emit( reload )
    jQuery('#rsvLinkAnyPayment').modal('hide')
  }

  openModal( op ){
    this.ml = null
    this.op = op

    jQuery('#rsvLinkAnyPayment').modal('show')
  }

  locSelected( e ){
    this.params = {
      op: this.op,
      zdUserId: e.zdUserId
    }

    this.genData = e
  }

  linkRsv(){

    this.loading['save'] = true;

    this._api.restfulPut( this.params, 'Rsv/linkPaymentV2' )
                .subscribe( res => {

                  this.loading['save'] = false;
                  this.toastr.success( res['msg'], res['msg'] );
                  this.params = {}
                  this.genData = {}
                  this.linked.emit( true )

                }, err => {
                  this.loading['save'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
