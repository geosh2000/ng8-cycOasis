import { Component, OnInit } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from 'src/app/services/service.index';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-search-cert',
  templateUrl: './search-cert.component.html',
  styleUrls: ['./search-cert.component.css']
})
export class SearchCertComponent implements OnInit {

  currentUser: any;
  showContents = false;
  mainCredential = 'rsv_manage';

  loading:Object = {}

  value:any
  results:any = []

  constructor(public _api: ApiService,
    public _init: InitService,
    private titleService: Title,
    private _tokenCheck: TokenCheckService,
    public toastr: ToastrService) { 

    this.currentUser = this._init.getUserInfo();
      this.showContents = this._init.checkCredential( this.mainCredential, true );

      this._tokenCheck.getTokenStatus()
          .subscribe( res => {

            if ( res['status'] ){
              this.showContents = this._init.checkCredential( this.mainCredential, true );
            }else{
              this.showContents = false;
              jQuery('#loginModal').modal('show');
            }
          });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Search Certificates');
  }

  clearVal() {
    this.value = ''
  }

  getCert(){
    console.log('Get Cert')
    this.loading['cert'] = true

    this._api.restfulPut( {v: this.value}, 'Lists/getBeFreeCert' )
                .subscribe( res => {

                  this.loading['cert'] = false;
                  this.results = res['data']

                }, err => {
                  this.loading['cert'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
