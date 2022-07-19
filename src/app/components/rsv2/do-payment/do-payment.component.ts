import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { SearchPaymentComponent } from '../../../shared/search-payment/search-payment.component';

@Component({
  selector: 'app-do-payment',
  templateUrl: './do-payment.component.html',
  styleUrls: ['./do-payment.component.css']
})
export class DoPaymentComponent implements OnInit {

  @ViewChild('shoes', {static: false}) _shoes:any
  @ViewChild(SearchPaymentComponent, {static: false}) _sp:SearchPaymentComponent
  @Output() paid  = new EventEmitter()
  @Input() ml:any

  selectAccount:FormGroup
  selectItems:FormGroup

  items:any = []
  loading:Object = {  }
  accounts:any = []
  itms:any = []
  remaining = 0
  accMon:any
  accSaldo:any = 0
  builtCheckOut:Object = {}
  paymentType = ''

  constructor(private _formBuilder: FormBuilder,
              public _api: ApiService,
              public _init: InitService,
              private _zh:ZonaHorariaService,
              public toastr: ToastrService) { }

  ngOnInit() {
    this.selectAccount = this._formBuilder.group({
      selectedAccount: ['', Validators.required]
    });
    this.selectItems = this._formBuilder.group({
      selectedItems: ['', Validators.required]
    });
  }

  onSelect( e, i, el ){

    let sel = JSON.parse(JSON.stringify(this.items))
    if( !e.checked ){
      let index = sel.indexOf(i)
      sel.splice(index,1)
    }else{
      if(this.remaining <= 0){
        this.toastr.error('No queda saldo suficiente para agregar otro item.', 'Error!')
        el['selected'] = false
        el['toPay'] = 0
        return false
      }
      sel.push(i)
    }

    sel.sort()
    this.items = sel
    this.selectItems.controls['selectedItems'].setValue(JSON.stringify(sel))

    let x = 0;
    for( let it of this.itms ){
      if( i == it['itemId'] ){
        if( e.checked ){
          let toPay = (it['montoParcial'] - it['montoAllPaid']) > 0 ? (it['montoParcial'] - it['montoAllPaid']) : (it['monto'] - it['montoAllPaid'])
          if( this.remaining - toPay < 0 ){
            this.itms[x]['toPay'] = this.remaining
            this.toastr.error('El saldo no es suficiente para ingresar ese monto, se ha ajustado el monto para que el saldo quede en 0', 'Monto inválido')
            this.remaining -= this.itms[x]['toPay']
          }else{
            this.itms[x]['toPay'] = (it['montoParcial'] - it['montoAllPaid']) > 0 ? (it['montoParcial'] - it['montoAllPaid']) : (it['monto'] - it['montoAllPaid'])
            this.remaining -= this.itms[x]['toPay']
          }
        }else{
          this.remaining += this.itms[x]['toPay']
          this.itms[x]['toPay'] = 0
        }
        return true
      }
      x++
    }
  }

  openModal( u, items ){
    this._sp.mail=this.ml
    this._sp.search()
    jQuery('#doPayment').modal('show')
    this.itms = JSON.parse(JSON.stringify(items))
    for( let i of this.itms ){
      i['montoAllPaid'] = parseFloat(i['montoPagado']) + parseFloat(i['montoEnValidacion'])
    }
    
    // console.log(this.itms)
    // this.getAccount( u )
  }

  mathOp( arr, s ){
    switch( s ){
      case '+':
        return parseFloat(arr[0]) + parseFloat(arr[1])
      case '-':
        return parseFloat(arr[0]) - parseFloat(arr[1])
    }
  }

  getAccount( u ){
    this.loading['accounts'] = true

    this._api.restfulGet( u, 'Rsv/getAccount' )
                .subscribe( res => {

                  this.loading['accounts'] = false;

                  this.accounts = res['data']

                }, err => {
                  this.loading['accounts'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  selAccount( e, stp ){

    if( e[0] ){
      this.selectAccount.controls['selectedAccount'].setValue(e[0]['operacion'])
      this.remaining = parseFloat(e[0]['montoSaldo'])
      this.accMon = e[0]['moneda'] == 'MEX' ? 'MXN' : e[0]['moneda']
      this.accSaldo = parseFloat(e[0]['montoSaldo'])
      this.paymentType = e[0]['tipo'].toLowerCase()
      stp.next()
    }
  }
  selAccountTest( e, stp ){
    console.log(e)
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

  test(e){
    let sel = []
    for( let i of e.selectedOptions.selected ){
      sel.push(i.value)
    }

    sel.sort()
    this.items = sel
    this.selectItems.controls['selectedItems'].setValue(JSON.stringify(sel))
  }

  changeAmmount(v, i){

    if( v > (i['monto'] - i['montoPagado']) ){
      i['toPay'] = (i['monto'] - i['montoPagado'])
      this.toastr.warning('El monto elegido sobrepasa el monto adeudado. Se modificó el monto a pagar. Quedará un saldo a favor', 'Monto inválido')
    }

    if( v < 0 ){
      i['toPay'] = 0
      this.toastr.error('El monto no puede ser negativo', 'Monto inválido')
    }

    console.log( 'sumRemains start' )
    this.sumRemain( i, (total,i) => {
      console.log( 'eval remaining' )
      if( this.accSaldo - total < 0 ){
        console.log( 'invalid', this.accSaldo, total, this.remaining )
        i['toPay'] -= total - this.accSaldo
        this.toastr.warning('El saldo no es suficiente para ingresar ese monto, se ha ajustado el monto para que el saldo quede en 0. Puedes continuar con la operación', 'Monto inválido')
        return true
      }else{
        console.log( 'valid', this.accSaldo, total, this.remaining )
        this.remaining = this.accSaldo - total
        return false
      }
    })

  }

  sumRemain( i, cb ){
    let flag = true
    while( flag ){
      console.log( 'run sum ')
      let total = 0
      for( let it of this.itms ){
        console.log('run for')
        if( it['toPay'] ){
          total += it['toPay']
        }
      }

      console.log( 'run callbacl ')
      flag = cb( total, i )
    }
  }

  buildCheckOut( el ){
    let totals = {
      account: this.selectAccount.controls['selectedAccount'].value,
      remain: this.accSaldo,
      totalUsed: this.accSaldo - this.remaining,
      balance: this.remaining,
      items: []
    }

    let itms = JSON.parse(JSON.stringify(this.itms))
    for( let i of itms ){
      if( i['toPay'] > 0 ){
        let paid = parseFloat(i['montoPagado']) + parseFloat(i['montoEnValidacion']) + parseFloat(i['toPay'])
        if( paid < parseFloat(i['monto']) ){
          i['isParcial'] = 1
          i['isPagoHotel'] = 0
          if( paid > parseFloat(i['montoParcial']) ){
            i['montoParcial'] = paid
          }
        }else{
          i['isParcial'] = 0
          i['isPagoHotel'] = 0
          i['montoParcial'] = paid
        }

        i['montoPagado'] = parseFloat(i['montoPagado'])
        i['montoEnValidacion'] = parseFloat(i['montoEnValidacion'])
        i['monto'] = parseFloat(i['monto'])
        i['toPay'] = parseFloat(i['toPay'])
        i['montoParcial'] = parseFloat(i['montoParcial'])
        i['account'] = this.selectAccount.controls['selectedAccount'].value
        totals.items.push(i)
      }
    }

    this.builtCheckOut = totals
    console.log(this.builtCheckOut)
    el.next()
  }

  checkOut( s ){
    let params = this.builtCheckOut['items']

    this.loading['checkOut'] = true

    this._api.restfulPut( params, 'Rsv/checkOut' )
                .subscribe( res => {

                  this.loading['checkOut'] = false;
                  this.toastr.success('Actualizando información, por favor espera.', 'Saldo aplicado!')
                  this.accounts = res['data']
                  this.paid.emit( true )
                  this.closeModal( s )

                }, err => {
                  this.loading['checkOut'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  closeModal( s ){
    this.selectAccount.reset()
    this.selectItems.reset()
    this.builtCheckOut = {}
    this.itms = []
    s.reset()
    jQuery('#doPayment').modal('hide')
  }

  isVigente( d ){
    if( moment.tz(d,this._zh.defaultZone).tz(this._zh.zone) > moment() ){
      return true
    }

    return false
  }

  showItem( i ){

    if( i['moneda'] != this.accMon ){
      return false
    }

    if( this.paymentType == 'deposito' && i['itemType'] == '10' && !this._init.checkSingleCredential('allmighty')){
      return false
    }

    if( i['isCancel'] == '1' ){
      return false
    }

    if( i['isQuote'] == '0' ){

      if( parseFloat(i['monto']) <= parseFloat(i['montoPagado']) ){
        return false
      }

    }else{

      if( !this.isVigente(i['vigencia']) ){
        return false
      }

    }

    return true

  }
}
