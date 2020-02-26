import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
import { OrderPipe } from 'ngx-order-pipe';
import { RsvAddPaymentComponent } from '../rsv-add-payment/rsv-add-payment.component';
import { RsvPaymentAdminComponent } from '../rsv-payment-admin/rsv-payment-admin.component';

@Component({
  selector: 'app-rsv-manage',
  templateUrl: './rsv-manage.component.html',
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
`]
})
export class RsvManageComponent implements OnInit, OnDestroy {

  // @ViewChild(AddNewAgentComponent) addNew:AddNewAgentComponent
  @ViewChild(RsvAddPaymentComponent,{static:false}) _addP:RsvAddPaymentComponent;
  @ViewChild(RsvPaymentAdminComponent,{static:false}) _adminP:RsvPaymentAdminComponent;

  currentUser: any;
  showContents = false;
  flag = false;
  listFlag = false;
  large = true;
  mainCredential = 'rsv_manage';
  loading:Object = {}

  viewLoc:any
  data:Object = {}
  originalData:Object = {}

  addPaymentItem:Object = {}

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

    this.activatedRoute.params.subscribe( params => {
      if ( params.loc ){
        this.viewLoc = params.loc;
        this.getLoc( params.loc )
        let title = 'CyC - Rsv Manager'
        if( this.viewLoc ){
          title += ` Loc: ${this.viewLoc}`
        }
        this.titleService.setTitle(title);
        jQuery('div.modal').modal('hide');
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Rsv Manager');
  }

  ngOnDestroy() {
    // jQuery('#rsvAddPayment').modal('hide')
    // jQuery('#rsvPaymentAdmin').modal('hide')
    jQuery('div.modal').modal('hide');
  }

  selectLoc( e ){
    this.route.navigateByUrl(`/rsv/${e['masterlocatorid']}`);
  }

  getLoc( loc ){

    this.loading['search'] = true;

    this._api.restfulPut( {loc}, 'Rsv/manageLoc' )
                .subscribe( res => {

                  this.loading['search'] = false;

                  let items = res['data']['items']
                  items = this.orderPipe.transform(items, 'itemlocator')

                  for( let i of items ){
                    i['ticketUrl']='http://oasishoteles.zendesk.com/agent/tickets/' + i['ticket']
                  }
                  let master = res['data']['master']

                  this.data = {
                    masterLoc: master,
                    items: items.length > 0 ? items : []
                  }

                  this.originalData = JSON.parse(JSON.stringify(this.data))
                  window.scrollTo(0, 380);


                }, err => {
                  this.loading['search'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  updateLoc( field, val, ml, loader, f ){

    this.loading[loader] = true;

    let params = {
      field,
      val,
      masterItemLocator: ml
    }

    this._api.restfulPut( params, 'Rsv/itemFieldChg' )
                .subscribe( res => {

                  this.loading[loader] = false;

                  this.toastr.success('Cambio guardado', res['data']['msg'])

                  f(true)

                }, err => {
                  this.loading[loader] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);
                  f(false)

                });
  }

  formatDate( d, f){
    return moment(d).format(f)
  }

  editItem( f, i ){

    let fields = {
      titular: ['titular', 'ro_titular'],
      comment: ['notas_hotel', 'ro_notas']
    }

    i[fields[f][1]] = false
  }

  pMethodChg( o, e ){
    this.updateLoc( 'fdp', e.value , o['masterItemLocator'], 'fdpChange', (f) => {
      if( f ){
        this.getLoc(o['masterlocatorid'])
      }else{
        o['fdp'] = o['fdp']
      }
    })

  }

  fieldEdit(f, o, e, l, fl ){
    console.log(e)
    this.updateLoc( f, e.target.value , o['masterItemLocator'], l, ( x ) => {
      if ( x ){
        return true
      }else{
        o[f] = o[f]
      }
      o[fl] = false
    })
  }

  toF(f){
    return parseFloat(f)
  }

  addPayment( o, i, admin = false ){
    if( admin ){
      this._adminP.openModal( i )
    }else{
      this._addP.openModal(o, i)
    }
  }

  closeAdd( flag ){
    this.addPaymentItem = {}
    jQuery('div.modal').modal('hide');
    if( flag ){
      this.getLoc( this.viewLoc )
    }
  }

  checkSaldo( i ){
    return parseFloat(i['monto']) > (parseFloat(i['montoPendiente']) + parseFloat(i['montoPagado']))
  }
}