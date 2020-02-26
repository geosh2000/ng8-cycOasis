import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rsv-link-payment-direct',
  templateUrl: './rsv-link-payment-direct.component.html',
  styleUrls: ['./rsv-link-payment-direct.component.css']
})
export class RsvLinkPaymentDirectComponent implements OnInit {

  @Output() linked = new EventEmitter<any>()
  @Input() genData:Object = {}

  loading = {}
  ml:any
  op:any
  pid:any

  params:Object = {}

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
    jQuery('#rsvLinkPaymentDirect').modal('hide')
  }

  openModal( op ){
    this.params = {
      op: null,
      zdUserId: op.zdUserId
    }
    this.genData = op

    jQuery('#rsvLinkPaymentDirect').modal('show')
  }

  locSelected( e ){
    this.params['op'] = e[0]['operacion']
    console.log(this.params)
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
