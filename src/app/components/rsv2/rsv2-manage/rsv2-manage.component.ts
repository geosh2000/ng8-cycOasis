import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, OnDestroy, ViewChildren } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { CompleterService, CompleterData } from 'ng2-completer';

import { Router, ActivatedRoute } from '@angular/router';


declare var jQuery: any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
import { OrderPipe } from 'ngx-order-pipe';
import { DoPaymentComponent } from '../do-payment/do-payment.component';
import { UploadImageComponent } from 'src/app/components/formularios/upload-image.component';
import { ZonaHorariaService } from '../../../services/zona-horaria.service';
import { RsvLinkPaymentDirectComponent } from '../../rsv/rsv-link-payment-direct/rsv-link-payment-direct.component';
import { RsvPaymentRegistryComponent } from '../../rsv/rsv-payment-registry/rsv-payment-registry.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RsvOpenDatesComponent } from '../rsv-open-dates/rsv-open-dates.component';
import { RsvOpenDatesSetComponent } from '../rsv-open-dates-set/rsv-open-dates-set.component';
import { RsvUpdateContactComponent } from '../rsv-update-contact/rsv-update-contact.component';
import { PaymentLinkGenComponent } from '../payment-link-gen/payment-link-gen.component';
import { RsvCancelItemComponent } from '../rsv-cancel-item/rsv-cancel-item.component';
import { ValidateCertificateComponent } from '../validate-certificate/validate-certificate.component';
import { RsvChangesComponent } from '../rsv-changes/rsv-changes.component';
import { CotizaPaxComponent } from '../cotiza-pax/cotiza-pax.component';
import { RsvInsurancesComponent } from '../rsv-insurances/rsv-insurances.component';
import { EditPrepayComponent } from '../edit-prepay/edit-prepay.component';

@Component({
  selector: 'app-rsv2-manage',
  templateUrl: './rsv2-manage.component.html',
  styleUrls: ['./rsv2-manage.component.css']
})
export class Rsv2ManageComponent implements OnInit, OnDestroy {

  @ViewChild(DoPaymentComponent, {static:false}) _payment:DoPaymentComponent
  @ViewChild(UploadImageComponent, {static: false}) _upl:UploadImageComponent
  @ViewChild(RsvLinkPaymentDirectComponent,{static:false}) _linkP:RsvLinkPaymentDirectComponent;
  @ViewChild(RsvPaymentRegistryComponent,{static:false}) _regP:RsvPaymentRegistryComponent;
  @ViewChild(RsvOpenDatesComponent,{static:false}) _od:RsvOpenDatesComponent;
  @ViewChild(RsvChangesComponent,{static:false}) _cg:RsvChangesComponent;
  @ViewChild(RsvOpenDatesSetComponent,{static:false}) _ods:RsvOpenDatesSetComponent;
  @ViewChild(RsvUpdateContactComponent,{static:false}) _updU:RsvUpdateContactComponent;
  @ViewChild(PaymentLinkGenComponent,{static:false}) _genL:PaymentLinkGenComponent;
  @ViewChild(RsvCancelItemComponent,{static:false}) _xld:RsvCancelItemComponent;
  @ViewChild(ValidateCertificateComponent,{static:false}) vc:ValidateCertificateComponent;
  @ViewChild(CotizaPaxComponent,{static:false}) _cp:CotizaPaxComponent;
  @ViewChild(RsvInsurancesComponent,{static:false}) _ins:RsvInsurancesComponent;

  penaltyXld:FormGroup

  currentUser: any;
  showContents = false;
  flag = false;
  listFlag = false;
  large = true;
  mainCredential = 'rsv_manage';
  loading:Object = {}
  viewLoc:any
  history:any = []
  mlTicket:any
  zdClientId:any
  rsvHistory = []
  zdUsers = []
  hideInsXld = true
  showMore = false

  maxPenalidad = 0
  xldPenalidad
  rlPayments = []

  data:Object = {
    master: {},
    items: []
  }

  cancelItemData:any = {}
  confirmItemData:any = {}
  comment:any = ''
  confirm:Object = {
    confirm: '',
    notas: ''
  }

  rsvType = 'Cotizacion'
  ccFlag = false

  resConf = {}

  viewPricesData = {
    'categoria': '',
    'hotel': '',
  }

  constructor(public _api: ApiService,
              public _init: InitService,
              private _formBuilder: FormBuilder,
              private titleService: Title,
              private _tokenCheck: TokenCheckService,
              public domSanitizer: DomSanitizer,
              private route: Router,
              private orderPipe: OrderPipe,
              private _zh:ZonaHorariaService,
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
            let title = 'CyC - Rsv Manager'
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
    this.titleService.setTitle('CyC - Rsv Manager');

    this.penaltyXld = this._formBuilder.group({
      penalty: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    jQuery('.modal').modal('hide');
  }

  setPenalty( e ){
    this.penaltyXld.controls['penalty'].setValue(this.xldPenalidad)
    console.log(this.penaltyXld)
    e.next()
  }

  addBlacklist(){
    this.loading['loc'] = true

    this._api.restfulPut( {ml: this.data['master']['masterlocatorid'], mlTicket: this.data['master']['mlTicket'], zdId: this.data['master']['zdUserId']}, 'Rsv/addBlacklist' )
                .subscribe( res => {

                  this.getLoc( this.data['master']['masterlocatorid'] )
                }, err => {
                  this.loading['loc'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  removeBlacklist(){
    this.loading['loc'] = true

    this._api.restfulPut( {ml: this.data['master']['masterlocatorid'], mlTicket: this.data['master']['mlTicket'], zdId: this.data['master']['zdUserId']}, 'Rsv/resetBlacklist' )
                .subscribe( res => {

                  this.getLoc( this.data['master']['masterlocatorid'] )
                }, err => {
                  this.loading['loc'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getRelatedPayments( i ){
    this.loading['rlPay'] = true

    this._api.restfulGet( i['itemLocatorId'], 'Rsv/itemPayments' )
                .subscribe( res => {

                  this.loading['rlPay'] = false;

                  this.rlPayments = res['data']
                }, err => {
                  this.loading['rlPay'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getLoc( l, s = '', f = ()=>void {}){
    this.showMore = false
    console.log('getting loc')
    this.loading['loc'] = true
    this.rsvHistory = []

    switch( s ){
      case 'links':
        this._genL.fullReload = true
        break
    }

    this._api.restfulGet( l, 'Rsv/manage2Loc' )
                .subscribe( res => {

                  this.loading['loc'] = false;

                  if( res['data']['master'] ){
                    let data = {
                      master: res['data']['master'],
                      items: res['data']['items']
                    }

                    data['master']['tickets'] = data['master']['tickets'] != null ? data['master']['tickets'].split(',') : []

                    // START Payment links build
                    if( data['master']['allLinks'] ){
                      let arr = JSON.parse(data['master']['allLinks'])
                      data['master']['allLinks'] = {}
                      for( let lnk of arr ){
                        data['master']['allLinks'][lnk['reference']] = lnk
                      }
                    }else{
                      data['master']['allLinks'] = {}
                    }

                    for( let i of data['items'] ){
                      if( i['referencias'] ){
                        i['referencias'] = i['referencias'].split(',')
                      }else{
                        i['referencias'] = []
                      }
                      if( i['links'] ){
                        // console.log(i['links'])
                        i['links'] = JSON.parse(i['links'])
                        i['linksMonto'] = 0
                        for( let lk of i['links'] ){
                          if( lk['active'] == 1 ){
                            i['linksMonto'] += parseFloat(lk['monto'])
                          }
                        }
                      }else{
                        i['links'] = []
                        i['linksMonto'] = 0
                      }
                      // END Payment links build
                    }

                    this.data = data
                    this.mlTicket = data['master']['mlTicket']
                    this.zdClientId = data['master']['zdUserId']
                    this.getHistory(data['master']['mlTicket'])
                    this.getRsvHistory(data['master']['zdUserId'])
                    this.rsvTypeCheck()

                    if( !data['master']['idioma'] ){
                      this._updU.open( data['master'] )
                    }

                    switch( s ){
                      case 'links':
                        this._genL.open( data )
                        this._genL.fullReload = false
                        break
                    }
                  }else{
                    this.data = {
                      master: {},
                      items: []
                    }
                  }

                  for( let i of this.data['items'] ){
                    if( i['itemType'] == 1 && i['insuranceRelated'] != null){
                      this._ins.reviewConsistence( this.data )
                      return 
                    }
                  }

                  f()




                }, err => {
                  this.loading['loc'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                  return false

                });

        return false;
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
    this.toastr.success('Monto Actuaizado','Success')

    if( e['reload'] ){
      this.getLoc( this.data['master']['masterlocatorid'] )
    }

    for( let i of this.data['items'] ){

      if( e['itemId'] == i['itemId'] ){

        if( e['montoPagado'] < i['montoPagado'] ){
          this.getLoc( this.viewLoc )
        }

        if( e['isMontoTotal'] ){

          console.log(e)
          console.log('monto', e['newmonto'], i['montoOriginal'], e['newMonto'] - i['montoOriginal'])
          console.log('montoParcial', e['montoParcial'], i['montoParcialOriginal'], e['montoParcial'] - i['montoParcialOriginal'])
          console.log(e)

          let dif = e['newMonto'] - i['montoOriginal']
          let difP = e['montoParcial'] - i['montoParcialOriginal']
          let mon = i['moneda']

          i['monto'] = e['newMonto']
          i['montoParcial'] = e['montoParcial']
          i['montoSaldoPrepago'] = e['montoParcial'] - i['montoPagado']
          i['montoSaldoHotel'] = i['monto'] - e['montoParcial']
          i['montoPagado'] = e['montoPagado']

          this.data['master']['totalMonto' + mon] = parseFloat(this.data['master']['totalMonto' + mon]) + dif
          this.data['master']['totalMontoHotel' + mon] = parseFloat(this.data['master']['totalMontoHotel' + mon]) + dif
          this.data['master']['totalMontoSaldo' + mon] = parseFloat(this.data['master']['totalMontoSaldo' + mon]) + difP
          this.data['master']['totalMontoHotel' + mon] = parseFloat(this.data['master']['totalMontoHotel' + mon]) - difP
        }else{
          let dif = e['montoParcial'] - i['montoParcialOriginal']
          let mon = i['moneda']

          i['isParcial'] = e['isParcial']
          i['isPagoHotel'] = e['isPagoHotel']
          i['montoParcial'] = e['montoParcial']
          i['tipoPago'] = e['tipoPago']
          i['confirm'] = e['confirm']
          i['isQuote'] = e['isQuote']
          i['montoSaldoPrepago'] = e['montoParcial'] - i['montoPagado']
          i['montoSaldoHotel'] = i['monto'] - e['montoParcial']

          this.data['master']['totalMontoSaldo' + mon] = parseFloat(this.data['master']['totalMontoSaldo' + mon]) + dif
          this.data['master']['totalMontoHotel' + mon] = parseFloat(this.data['master']['totalMontoHotel' + mon]) - dif
        }

        break
      }
    }


    this.rsvTypeCheck()
    this.getHistory(this.mlTicket)
  }

  reactivate(i){
    this.loading['reactivate'] = true

    this._api.restfulPut( i, 'Rsv/reactivate' )
                .subscribe( res => {

                  this.loading['reactivate'] = false;

                  this.toastr.success('Rsva Reactivada','Correcto!')
                  this.getLoc( this.viewLoc )
                  this.getHistory(this.mlTicket)

                }, err => {
                  this.loading['reactivate'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }


  saveName( e ){

    for( let i of this.data['items'] ){
      if( e['itemId'] == i['itemId'] ){
        i['nombreCliente'] = e['nombre']
        break
      }
    }


    this.rsvTypeCheck()
    this.getHistory(this.mlTicket)
  }

  selectLoc( e ){
    this.route.navigateByUrl(`/rsv2/${e['masterlocatorid']}`);
  }

  formatDate( d, f, z = false ){
    if( z ){
      return moment.tz(d,this._zh.defaultZone).tz(this._zh.zone).format(f)
    }else{
      return moment(d).format(f)
    }
  }

  isVigente( d ){
    if( moment.tz(d,this._zh.defaultZone).tz(this._zh.zone) > moment() ){
      return true
    }

    return false
  }

  colorConfirm( i, v = true, q = false ){
    if( !v && q){
      return 'text-danger'
    }

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

  formatHistory( t ){
    let r = t

    r = r.replace(/[\n]/gm,'<br>')

    return r
  }

  getRsvHistory( zdClientId = this.zdClientId ){

    this.loading['rsvHistory'] = true
    this.rsvHistory = []

    this._api.restfulGet( zdClientId, 'Rsv/getRsvHistory' )
                .subscribe( res => {

                  this.loading['rsvHistory'] = false;
                  let rh = []

                  this.rsvHistory = res['data']

                }, err => {
                  this.loading['rsvHistory'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  cancelItem(i){
    this._xld.cancelItem(i)
  }

  confirmItem(i){
    this.confirmItemData = i
    jQuery('#regConfirm').modal('show')
  }

  confirmCancel(){
    if( this.cancelItemData['isQuote'] == 1 ){
      this.sendCancellation()
    }else{
      if(this._init.currentUser.credentials['rsv_cancelAll'] == 1){
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

    let params = {data: this.cancelItemData, flag}

    if( this.xldPenalidad != null ){
      params['penalidad'] = this.xldPenalidad
    }

    this._api.restfulPut( params, 'Rsv/cancelItem' )
                .subscribe( res => {

                  this.loading['cancel'] = false;
                  jQuery('#cancelConfirm').modal('hide')
                  this.xldPenalidad = null
                  this.maxPenalidad = 0
                  this.getLoc(this.viewLoc)

                }, err => {
                  this.loading['cancel'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  closeCancelModal(){
    jQuery('#cancelConfirm').modal('hide')
    this.xldPenalidad = null
    this.maxPenalidad = 0
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

  uplImg(i){
    this._upl.build('Voucher '+ i['itemLocatorId'], i['itemLocatorId'], 'voucher_'+i['itemLocatorId'], true, 'voucher')
  }

  imgLoaded( e ){
    if( !e.ERR ){
      this.toastr.success(e.msg, 'Cargado')
      this.getHistory()
    }else{
      this.toastr.error(e.msg, 'ERROR!')
    }
  }

  linked(e){
    this._linkP.closeModal()
  }

  openOD( i ){
    this._od.open( i, this.mlTicket )
  }

  changeItem( i ){
    this._cg.open( i, this.mlTicket )
  }

  openODSet( i ){
    this._ods.open( i, this.mlTicket, this.data['master']['idioma'] )
  }

  updateContact( customFlag = false, customMsg = ''){
    this._updU.open( this.data['master'], customFlag, customMsg )
    // this._updU.updateUser( this.data['master']['masterlocatorid'] )
  }

  updateOr(){
    this.loading['orUpdate'] = true

    this._api.restfulPut( {masterlocatorid: this.viewLoc}, 'Rsv/updateORewardsUser' )
                .subscribe( res => {

                  this.loading['orUpdate'] = false;
                  this.data['master']['orId'] = res['data']['orId']
                  this.data['master']['orLevel'] = res['data']['orLevel']
                  this.toastr.success( res['msg'], 'Actualizado' );

                }, err => {
                  this.loading['orUpdate'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  updateRelatedTicket(){
    this.loading['rlTicket'] = true

    this._api.restfulPut( {loc: this.viewLoc}, 'Calls/getZdItemRelated' )
                .subscribe( res => {

                  this.loading['rlTicket'] = false;
                  this.toastr.success( res['msg'], 'Actualizado' );
                  this.getLoc( this.viewLoc )

                }, err => {
                  this.loading['rlTicket'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  editCCMail( m ){

    if( jQuery(m)[0].validity.patternMismatch ){
      this.toastr.error('El formato del correo ingresado es incorrecto', 'Formato no reconocido')
      return false
    }

    console.log( jQuery(m)[0].value )
    console.log( !jQuery(m)[0].validity.patternMismatch )
    this.loading['editCC'] = true

    this._api.restfulPut( {ticket: this.mlTicket, cc: jQuery(m)[0].value, ml: this.viewLoc}, 'Rsv/editCCMail' )
                .subscribe( res => {

                  this.loading['editCC'] = false;
                  this.comment = ''
                  this.data['master']['cc'] = jQuery(m)[0].value
                  this.ccFlag = false
                  this.toastr.success( res['msg'], 'GUARDADO' );

                }, err => {
                  this.loading['editCC'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  resetConfirm( f , i = {} ){
    if( !f ){
      this.resConf = {
        actual: i['confirm'],
        itemLocatorId: i['itemLocatorId'],
        mlTicket: this.mlTicket,
        itemId: i['itemId']
      }

      jQuery('#resetConfirm').modal('show')
      return true
    }

    this.loading['reset'] = true

    this._api.restfulPut( this.resConf, 'Rsv/resetConfirmation' )
                .subscribe( res => {

                  this.loading['reset'] = false;
                  this.toastr.success( res['msg'], 'RESET' );
                  this.resConf = {}
                  this.getLoc(this.viewLoc)
                  jQuery('#resetConfirm').modal('hide')

                }, err => {
                  this.loading['reset'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });

  }

  sendMailConfirm(){
    this.loading['sendConf'] = true

    this._api.restfulPut( {loc: this.viewLoc}, 'Rsv/sendFullConf' )
                .subscribe( res => {

                  this.loading['sendConf'] = false;
                  this.toastr.success( res['msg'], 'Enviado' );
                  this.getHistory(this.mlTicket)

                }, err => {
                  this.loading['sendConf'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  urlCopy( d ){
    return `https://cyc-oasishoteles.com/api/rf/index.php/Rsv/verConfirmacion/${d['masterlocatorid']}/${encodeURIComponent(d['correoCliente'])}`
  }

  validateCert( i ){
    this.vc.open( i )
  }

  addCourtesyTransfer( flag = true ){
    this.loading['cTransfer'] = true

    this._api.restfulPut( {mlTicket: this.mlTicket, loc: this.viewLoc, flag: flag}, 'Rsv/hasTransfer' )
                .subscribe( res => {

                  this.loading['cTransfer'] = false;
                  this.toastr.success( res['msg'], flag ? 'Traslado en cortesía marcado' : 'Traslado en cortesía eliminado' );
                  this.data['master']['hasTransfer'] = flag
                  this.getHistory(this.mlTicket)

                }, err => {
                  this.loading['cTransfer'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  changeCreator(){

    this.getZdAgents()
    jQuery('#changeCreator').modal('show')

  }

  getZdAgents(){
    this.loading['zdAgents'] = true

    this._api.restfulGet( '', 'Lists/assignUserList' )
                .subscribe( res => {

                  this.loading['zdAgents'] = false;
                  this.zdUsers = res['data']

                }, err => {
                  this.loading['zdAgents'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  selectedAg( e ){
    this.loading['chgAgent'] = true

    this._api.restfulPut( {ml: this.data['master']['masterlocatorid'], mlTicket: this.mlTicket, newUser: e.value['id'], newName:  e.value['Nombre'], oldName: this.data['master']['creador']}, 'Rsv/chgAgent' )
                .subscribe( res => {

                  this.loading['chgAgent'] = false;
                  this.data['master']['creador'] = e.value['Nombre']
                  jQuery('#changeCreator').modal('hide')
                  this.toastr.success( 'Creador Modificado', 'Nuevo creador establecido como ' + e.value['Nombre'] );
                  this.getHistory( this.data['master']['mlTicket'])

                }, err => {
                  this.loading['chgAgent'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
    
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  saveFromCotizaPax(e){
    if( e ){
      this.getLoc( this.viewLoc )
    }else{
      (async () => { 

        await this.delay(2000);

        this.getLoc( this.viewLoc )
    })();
    }
  }

  manageIns(){
    if( this.data['master']['esNacional'] == null ){
      this.toastr.error('Por favor edita la nacionalidad del cliente para continuar.', 'Nacionalidad no identificada')
      this.updateContact( true, "Selecciona el lápiz para editar al cliente e ingresar su nacionalidad. <br> Si ya està ingresada la nacionalidad, sólo da click en <b>'la palomita'</b>. Cuando vuelva a cargar la reserva intenta nuevamente dar clic en 'Gestionar Seguros'")
    }else{
      this._ins.open(this.data)
    }

    return true;
  }

  openInsurance(){
    console.log('calling insurance')
    this._ins.open(this.data)
  }

  reloadMl(){

    console.log('called reload ticket')

    this._ins.loading['cotizando'] = true

    console.log('calling with callback')
    this.getLoc( this.viewLoc, '', () => this._ins.open(this.data) )

  }


}
