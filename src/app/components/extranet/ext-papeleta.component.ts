import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, OnDestroy, ViewChildren, Output, EventEmitter } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CompleterService, CompleterData } from 'ng2-completer';

import { Router, ActivatedRoute } from '@angular/router';


declare var jQuery: any;
import * as moment from 'moment-timezone';
import * as Globals from '../../globals';
import { OrderPipe } from 'ngx-order-pipe';
import { UploadImageComponent } from '../formularios/upload-image.component';

@Component({
  selector: 'app-ext-papeleta',
  templateUrl: './ext-papeleta.component.html',
  styleUrls: ['./ext-papeleta.component.css']
})
export class ExtPapeletaComponent implements OnInit {

  @ViewChild(UploadImageComponent, {static: false}) _upl:UploadImageComponent
  @Output() reload = new EventEmitter<any>()

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
  confirmation:any = ''
  confirmationCancel:any = ''
  puoRo = true
  puiRo = true

  data:Object = {
    master: {},
    items: [],
    payments: []
  }

  cancelItemData:any = {}
  confirmItemData:any = {}
  comment:any = ''
  confirm:Object = {
    confirm: '',
    notas: ''
  }

  rsvType = 'Cotizacion'
  hrIndex = Globals.HREF

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
            if( this.showContents ){
              if ( params.loc ){
                this.viewLoc = params.loc;
                this.getLoc( params.loc )
                let title = 'CyC - Extranet Manager'
                if( this.viewLoc ){
                  title += ` Loc: ${this.viewLoc}`
                }
                this.titleService.setTitle(title);
                jQuery('div.modal').modal('hide');
              }
            }
          });
  }

  ngOnInit() {

  }

  mailTo( d ){
    let m = 'contact@oasishoteles.com'
    let sb = 'Seguimiento%20de%20confirmación%20de%20item%20' + d['items'][0]['itemLocatorId']
    let bd = 'Este%20es%20un%20seguimiento%20para%20la%20confirmación%20del%20item:%20https://cyc-oasishoteles.com/#/extranet/' + d['items'][0]['itemLocatorId']
    let t = `mailto:${m}?subject=${sb}&body=${bd}`

    return t
  }

  savePu( t, v ){

    this.loading[t] = true
    let params = {
      itemId: this.data['items'][0]['itemId']
    }
    if( t == 'puo' ){
      params['dtPickUpOut'] = jQuery(v).val() + ' (capturado por: ' + this._init.currentUser.username + ' ' + moment().format('YYYY-MM-DD HH:mm') + ')'
    }else{
      params['dtPickUpIn'] = jQuery(v).val() + ' (capturado por: ' + this._init.currentUser.username + ' ' + moment().format('YYYY-MM-DD HH:mm') + ')'
    }

    this._api.restfulPut( params, 'Rsv/editPickup' )
                .subscribe( res => {

                  this.loading[t] = false;

                  this.data['items'][0][t == 'puo' ? 'dtPickUpOut' : 'dtPickUpIn'] = jQuery(v).val() + ' (capturado por: ' + this._init.currentUser.username + ')'
                  this.puoRo = true

                  this.toastr.success( res['msg'], 'Pickup guardado' );

                }, err => {
                  this.loading[t] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getLoc( l ){
    this.loading['loc'] = true
    this.confirmation = ''
    this.confirmationCancel = ''
    this.data = {
      master: {},
      items: [],
      payments: []
    }

    this._api.restfulGet( l, 'Rsv/getItem' )
                .subscribe( res => {

                  this.loading['loc'] = false;

                  if( res['data']['master'] ){
                    let data = {
                      master: res['data']['master'],
                      items: res['data']['items'],
                      payments: res['payments']
                    }

                    for( let p of data['payments'] ){
                      p['items'] = p['items'] ? p['items'].split(',') : ['']
                    }

                    data['master']['tickets'] = data['master']['tickets'] != null ? data['master']['tickets'].split(',') : []

                    this.data = data
                    this.mlTicket = data['master']['mlTicket']
                    this.getHistory(data['master']['mlTicket'])
                    this.rsvTypeCheck()
                  }else{
                    this.data = {
                      master: {},
                      items: [],
                      payments: []
                    }
                  }

                  console.log(this.data)
                  console.log(this.mlTicket)


                }, err => {
                  this.loading['loc'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  rsvTypeCheck(){
    let x = 0
    let c = 0
    for( let i of this.data['items'] ){
      x++
      if( i['isQuote'] == 0 && i['isCancel'] == 0 ){
        this.rsvType = 'Reserva'
      }
      if( i['isCancel'] == '1' ){
        c++
      }
    }

    if( c == x ){
      this.rsvType = 'Cancelada'
    }
  }

  saveMonto( e ){
    for( let i of this.data['items'] ){
      if( e['itemId'] == i['itemId'] ){
        i['isParcial'] = e['isParcial']
        i['isPagoHotel'] = e['isPagoHotel']
        i['montoParcial'] = e['montoParcial']
        i['tipoPago'] = e['tipoPago']
        i['confirm'] = e['confirm']
        i['isQuote'] = e['isQuote']
        return true
      }
    }
    this.rsvTypeCheck()
    this.getHistory(this.mlTicket)
  }

  selectLoc( e ){
    this.route.navigateByUrl(`/rsv2/${e['masterlocatorid']}`);
  }

  formatDate( d, f ){
    return moment(d).format(f)
  }

  colorConfirm( i ){
    switch( i ){
      case 'Cancelada':
        return 'text-danger'
      case 'Cotización':
      case 'Cotizacion':
        return 'text-warning'
      case 'Pendiente':
        return 'text-info'
      default:
        return 'text-success'
    }
  }

  getDiff( a, b ){
    return parseFloat(a)-parseFloat(b)
  }

  paid( f ){
    if( f ){
      this.getLoc( this.viewLoc )
    }
  }

  getHistory( tkt = this.mlTicket ){
    this.loading['history'] = true

    this._api.restfulGet( tkt, 'Rsv/getHistory' )
                .subscribe( res => {

                  this.loading['history'] = false;

                  this.history = this.orderPipe.transform(res['data'], 'Fecha', true)

                }, err => {
                  this.loading['history'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  cancelItem(i){
    this.cancelItemData = i
    jQuery('#cancelConfirm').modal('show')
  }

  confirmItem(i){
    this.confirmItemData = i
    jQuery('#regConfirm').modal('show')
  }

  confirmCancel(){
    if( this.cancelItemData['isQuote'] == 1 ){
      this.sendCancellation()
    }else{
      if(this._init.currentUser.credentials['rsv_cancelAll']){
        this.sendCancellation( true )
      }else{
        this.toastr.error( 'La reserva ya cuenta con pagos, solicita a tu gerente realizar la cancelación', 'No es podible cancelar' )
      }
    }
  }

  saveConfirm(){
    this.loading['confirm'] = true

    this.confirm['item'] = this.confirmItemData

    this._api.restfulPut( this.confirm, 'Rsv/saveConfirm' )
                .subscribe( res => {

                  this.loading['confirm'] = false;
                  jQuery('#regConfirm').modal('hide')
                  this.getLoc(this.viewLoc)
                  this.confirm = {
                    confirm: '',
                    notas: ''
                  }

                }, err => {
                  this.loading['confirm'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  sendCancellation( flag = false ){
    this.loading['cancel'] = true

    this._api.restfulPut( {data: this.cancelItemData, flag}, 'Rsv/cancelItem' )
                .subscribe( res => {

                  this.loading['cancel'] = false;
                  jQuery('#cancelConfirm').modal('hide')
                  this.getLoc(this.viewLoc)

                }, err => {
                  this.loading['cancel'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  sendComment(){
    this.loading['comment'] = true

    this._api.restfulPut( {ticket: this.mlTicket, comment: this.comment}, 'Rsv/sendComment' )
                .subscribe( res => {

                  this.loading['comment'] = false;
                  this.comment = ''
                  this.getHistory(this.mlTicket)

                }, err => {
                  this.loading['comment'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  sendConfirm( i, f ){
    let params = {
      itemId: i.itemId,
      itemLocatorId: i.itemLocatorId,
      mlTicket: i.mlTicket,
      isCancel: i['isCancel'] == '1',
      confirm: f ? this.confirmation : this.confirmationCancel
    }

    this.loading['confirm'] = true

    this._api.restfulPut( params, 'Rsv/extranetConfirm' )
                .subscribe( res => {

                  this.loading['confirm'] = false;
                  this.getLoc( this.viewLoc )
                  this.reload.emit(true)

                }, err => {
                  this.loading['confirm'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  printP(){
    // let mywindow = window.open('', 'PRINT', 'height=400,width=600');

    // // mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    // mywindow.document.write('<html>');
    // mywindow.document.write('</head><body >');
    // // mywindow.document.write('<h1>' + document.title  + '</h1>');
    // mywindow.document.write(document.getElementById('thisPaperConfirmView').innerHTML);
    // mywindow.document.write('</body></html>');

    // mywindow.document.close(); // necessary for IE >= 10
    // mywindow.focus(); // necessary for IE >= 10*/

    // mywindow.print();
    // mywindow.close();

    // return true;

    let restorepage = $('body').html();
    let printcontent = $('#thisPaperConfirmView').html();
    $('body').empty().html( printcontent ).addClass('bodyPrint');
    window.print();
    $('body').html(restorepage);
  }
  

}
