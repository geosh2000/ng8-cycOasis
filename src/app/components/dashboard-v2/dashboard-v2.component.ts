import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dasboard-v2',
  templateUrl: './dashboard-v2.component.html',
  styleUrls: ['./dashboard-v2.component.css']
})
export class DashboardV2Component implements OnInit, OnDestroy {

  mainCredential

  data:any = []
  loading = {}
  selectedReport = {}
  to:any
  reportValue:any = 'venta'

  constructor(public _api: ApiService,
              public _init: InitService,
              private titleService: Title,
              private _tokenCheck: TokenCheckService,
              public toastr: ToastrService) {


          this._tokenCheck.getTokenStatus()
          .subscribe( res => {

            if ( !res['status'] ){
              jQuery('#loginModal').modal('show');
            }
          });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Dashboards');

    this.getDashList()
  }

  ngOnDestroy() {
    jQuery('.modal').modal('hide');
  }

  getDashList(){
    this.loading['list'] = true

    this._api.restfulGet( '', 'Lists/dashboards' )
        .subscribe( res => {

          this.loading['list'] = false;
          this.data = res['data']

        }, err => {
          this.loading['list'] = false;

          const error = err.error;
          this.toastr.error( error.msg, err.status );
          console.error(err.statusText, error.msg);

        });
  }

  selected( e ){
    this.reportValue = e.value['value']
  }

  reload( to = this.to ){
    if( to ){
      clearTimeout( to )
    }

    if( this.selectedReport['refreshRate'] ){
      this.to = window.setTimeout( () => {
        jQuery('#dashFrame').src = this.selectedReport['iframe']
        this.reload()
      }, this.selectedReport['refreshRate'])
    }
  }

}
