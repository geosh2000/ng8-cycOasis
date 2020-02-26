import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ExtPapeletaComponent } from './ext-papeleta.component';
import { ApiService, InitService, TokenCheckService } from 'src/app/services/service.index';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-extranet',
  templateUrl: './extranet.component.html',
  styleUrls: ['./extranet.component.css']
})
export class ExtranetComponent implements OnInit, AfterViewInit {

  @ViewChild(ExtPapeletaComponent, {static: false}) _ppl:ExtPapeletaComponent

  currentUser: any;
  showContents = false;
  flag = false;
  listFlag = false;
  large = true;
  mainCredential = 'rsv_extranet';
  loading:Object = {}
  viewLoc:any
  history:any = []
  mlTicket:any

  data:Object = {
    cancel: [],
    confirm: []
  }

  constructor(public _api: ApiService,
              public _init: InitService,
              private titleService: Title,
              private _tokenCheck: TokenCheckService,
              private route: Router,
              private orderPipe: OrderPipe,
              private activatedRoute: ActivatedRoute,
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
    this.titleService.setTitle('CyC - Extranet Manager');
    this.getRsvs()
  }

  ngAfterViewInit(): void {

  }

  getRsvs(){
    this.loading['loc'] = true


    this._api.restfulPut( '', 'Rsv/listConfirm' )
                .subscribe( res => {

                  this.loading['loc'] = false;

                  this.data = res['data']


                }, err => {
                  this.loading['loc'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatDate( d, f ){
    return moment(d).format(f)
  }

  goToXtra( i ){
    this.route.navigateByUrl(`/extranet/${i}`);
  }

  reload( e ){
    this.getRsvs()
  }

}
