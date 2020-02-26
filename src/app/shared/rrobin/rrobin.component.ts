import { Component, OnInit } from '@angular/core';
import { ApiService, TokenCheckService, RrobinService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rrobin',
  templateUrl: './rrobin.component.html',
  styles: [`
    .mat-radio-button ~ .mat-radio-button {
      margin-left: 16px;
    }
    .mat-success {
      background-color: #33a933;
      color: #fff;
    }
    .mat-alert {
      background-color: #e2be0c;
      color: #fff;
    }
    .mat-info {
      background-color: #34a3b5;
      color: #fff;
    }
    .mat-pdt {
      background-color: #72658c;
      color: #fff;
    }
    .mat-offline {
      background-color: rgba(255,255,255,.32);
      color: rgba(0,0,0,.26);
    }

    mat-accordion{
      width: 100% !important;
      max-width: 780px
    }

    .acc-headers .mat-expansion-panel-header-description {
      justify-content: space-between;
      align-items: center;
    }

    mat-form-field {
      margin-right: 12px;
    }
  `]
})
export class RrobinComponent implements OnInit {

  loading = false

  constructor( private _srv:TokenCheckService,
              private _api:ApiService,
              public rr:RrobinService,
              public toastr: ToastrService ) { }

  ngOnInit() {
  }

  login(){
    this.loading = true
    this._api.restfulPut( null, 'Rrobin/logIn' )
                .subscribe( res => {

                  this.rr.st = res['data']
                  this.loading = false

                }, err => {
                  this.loading = false
                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  logout(){
    this.loading = true
    this._api.restfulPut( null, 'Rrobin/logOut' )
                .subscribe( res => {

                  this.rr.st = !res['data']
                  this.loading = false

                }, err => {
                  this.loading = false
                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
