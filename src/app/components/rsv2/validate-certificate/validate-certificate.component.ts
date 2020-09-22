import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;

@Component({
  selector: 'app-validate-certificate',
  templateUrl: './validate-certificate.component.html',
  styleUrls: ['./validate-certificate.component.css']
})
export class ValidateCertificateComponent implements OnInit {

  @Output() savedCert  = new EventEmitter()
  @ViewChild('stepper', {static: false}) _stp: any

  folio:any
  item = {}
  loading = {}
  results = []
  initFlag = true
  selectedCert = {}

  constructor( 
      private _api: ApiService,
      private toastr: ToastrService
    ) { }

  ngOnInit() {
  }

  open( i ){
    this.initFlag = true
    this.selectedCert = {}
    this.item = i
    this.folio = ''
    this._stp.reset()
    jQuery('#validateCert').modal('show')
  }

  getCert( el ){

    el.next()

    this.loading['cert'] = true
    this.initFlag = false

    this._api.restfulPut( {v: this.folio}, 'Lists/getBeFreeCert' )
                .subscribe( res => {

                  this.loading['cert'] = false;
                  this.results = res['data']

                  if( this.results.length <= 0 ){
                    el.previous()
                  }

                }, err => {
                  this.loading['cert'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  selectCert( c, el ){
    el.next()
    this.selectedCert = c
  }

  saveCert( el ){
    this.loading['saveCert'] = true
    this.initFlag = false

    this._api.restfulPut( {item: this.item, cert: this.selectedCert}, 'Rsv/saveBeFreeCert' )
                .subscribe( res => {

                  this.loading['saveCert'] = false;
                  this.closeModal( el )
                  this.savedCert.emit( true )

                }, err => {
                  this.loading['saveCert'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
    
  }

  closeModal( el ){
    el.reset()
    jQuery('#validateCert').modal('hide')
  }

}
