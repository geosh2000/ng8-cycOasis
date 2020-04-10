import { Component, OnInit, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import { ApiService } from '../../../services/api.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-payment-link-gen',
  templateUrl: './payment-link-gen.component.html',
  styleUrls: ['./payment-link-gen.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class PaymentLinkGenComponent implements OnInit {

  @Output() saved = new EventEmitter()
  @Output() reloadTkt = new EventEmitter()
  @Output() reloadFull = new EventEmitter()

  loading = false
  ml:any
  mlInfo:any
  flagDif = false
  newData:any
  data:any = []
  items:any = []
  selMon = true
  summary = {}
  mergeFlag = false
  mergeSel = false
  vcmAfil:any
  links = []
  fullReload = false

  constructor( private _api:ApiService, private toastr:ToastrService ) { }

  ngOnInit() {
  }

  open( ml ){

    // console.log(ml)

    this.ml = ml['master']['masterlocatorid']
    this.data = ml
    this.selMon = ml['master']['moneda'] == 'MXN'

    let items = []

    for( let i of ml['items'] ){
      if( this.validate(i) ){
        items.push(i)
      }
    }

    this.items = JSON.parse(JSON.stringify(items))

    jQuery('#genLink').modal('show')
  }

  close(){
    this.resetAll( true )
    jQuery('#genLink').modal('hide')
    jQuery('#showLink').modal('hide')
    this.fullReload = false
  }

  closeShown(){
    this.saved.emit(true)
    this.close()
  }

  createLinks(){
    this.links = []

    for( let af in this.summary ){
      if( this.summary.hasOwnProperty(af) ){
        for( let p in this.summary[af] ){
          if( this.summary[af].hasOwnProperty(p) && (this.summary[af][p]['status'] == 0 || this.summary[af][p]['status'] == 3) && !this.summary[af][p]['mergedVcm'] ){
            this.links.push( {afiliacion: af, promo: p, moneda: this.summary[af][p]['moneda'], cuenta: this.summary[af][p]['cuenta'], total: this.summary[af][p]['total'], status: false} )
          }
        }
      }
    }

    this.getLinks( this.links )
  }

  showLinks(){
    jQuery('#genLink').modal('hide')
    jQuery('#showLink').modal('show')
    this.reloadTkt.emit(true)
  }

  isError( res, l, f ){
    this.loading = false;

    const error = res['data'];
    this.toastr.error( res['response'], 'Error!' );
    l['status'] = true
    l['error'] = true
    l['data'] = res
    this.summary[l['afiliacion']][l['promo']]['status'] = 3
    this.getLinks( this.links, f )
  }

  getLinks( arr = this.links, fullCount = 0 ){

    this.loading = true

    for( let l of this.links ){

      if( !l['status'] ){

        let ref = `${this.ml}-${moment().format('x')}`

        let params = {
          link: {
            reference: ref,
            amount: parseFloat(l['total']).toFixed(2),
            moneda: l['moneda'],
            omitir_notif_default: 0,
            promociones: l['promo'],
            st_correo: 0,
            fh_vigencia: moment().add(2,'days').format('DD/MM/YYYY'),
            mail_cliente: this.data['master']['correoCliente']
          },
          db: [],
          itemsLocators: '',
          mlTicket: this.data['master']['mlTicket']
        }

        for( let it of this.summary[l['afiliacion']][l['promo']]['items'] ){
          let tmpArr = {
            reference: ref,
            itemId: it['itemId'],
            monto: it['monto'],
            moneda: l['moneda'],
            afiliacion: l['afiliacion'],
            cuenta: l['cuenta'],
            promo: l['promo'],
            vigencia: moment().add(2,'days').format('YYYY-MM-DD')
          }
          params['db'].push(tmpArr)
          params['itemsLocators'] += it['item'] + ','
        }

        if( this.summary[l['afiliacion']][l['promo']]['vcmItems'] ){
          for( let it of this.summary[l['afiliacion']][l['promo']]['vcmItems'] ){
            let tmpArr = {
              reference: ref,
              itemId: it['itemId'],
              monto: it['monto'],
              moneda: l['moneda'],
              afiliacion: l['afiliacion'],
              cuenta: l['cuenta'],
              promo: l['promo'],
              vigencia: moment().add(2,'days').format('YYYY-MM-DD')
            }
            params['db'].push(tmpArr)
            params['itemsLocators'] += it['item'] + ','
          }
        }

        this.summary[l['afiliacion']][l['promo']]['status'] = 1
        this._api.restfulPut( params, 'Pagos/getLink' )
                .subscribe( res => {

                  if( res['data']['error'] ){
                    this.isError( res, l, fullCount )
                  }else{
                    this.loading = false;
                    l['status'] = true
                    l['error'] = false
                    l['data'] = res

                    this.summary[l['afiliacion']][l['promo']]['status'] = 2
                    this.summary[l['afiliacion']][l['promo']]['reference'] = params['link']['reference']
                    this.summary[l['afiliacion']][l['promo']]['link'] = res['data']['link']
                    fullCount++

                    if( fullCount == this.links.length ){
                      console.log('all done!')
                      this.showLinks()
                    }else{
                      this.getLinks( this.links, fullCount )
                    }
                  }

                }, err => {
                  this.loading = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);
                  l['status'] = true
                  l['error'] = true
                  l['data'] = err
                  this.summary[l['afiliacion']][l['promo']]['status'] = 3
                  this.getLinks( this.links, fullCount )

                });
        break
      }
    }

  }

  validate( i ){

    if( i['isCancel'] == 1 ){
      return false
    }

    if( moment() > moment(i['vigencia']) && i['isQuote'] == 1 ){
      return false
    }


    // CHANGE OPERATOR FOR <= TO SKIP TESTS
    if( parseFloat(i['montoParcial']) <= parseFloat(i['montoPagado']) ){
      return false
    }

    if( i['moneda'] != (this.selMon ? 'MXN' : 'USD') ){
      return false
    }

    return true
  }

  sumReport( e ){
    let r = {}
    let flag = false

    for( let i of this.items ){
      if( i['checked'] ){

        if( i['cuentaSantander'] != 'VCM' && i['promo'] == 'C' ){
          flag = true
        }

        if( i['cuentaSantander'] == 'VCM' ){
          this.vcmAfil = i['afiliacion']
        }

        let arr = {
          itemId: i['itemId'],
          monto: i['montoParcial'] - i['montoPagado'] - i['linksMonto'],
          item: i['itemLocatorId'],
          details: i
        }

        if( r[i['afiliacion']] ){
          if( r[i['afiliacion']][i['promo']] ){
            r[i['afiliacion']][i['promo']]['items'].push(arr)
            r[i['afiliacion']][i['promo']]['total'] += (i['montoParcial'] - i['montoPagado'])
          }else{
            r[i['afiliacion']][i['promo']] = {total: i['montoParcial'] - i['montoPagado'], cuenta: i['cuentaSantander'], moneda: this.selMon ? 'MXN' : 'USD', status: 0, items: [arr]}
          }
        }else{
          r[i['afiliacion']] = {[i['promo']]: {total: i['montoParcial'] - i['montoPagado'], cuenta: i['cuentaSantander'], moneda: this.selMon ? 'MXN' : 'USD', status: 0, items: [arr]}}
        }
      }
    }

    this.summary = r
    this.mergeFlag = flag
  }

  mergeVcm( c ){
    c['merged'] = true
    c['total'] += this.summary[this.vcmAfil]['C']['total']
    c['vcmItems'] = this.summary[this.vcmAfil]['C']['items']
    this.summary[this.vcmAfil]['C']['mergedVcm'] = true
    this.mergeSel = false
  }

  splitVcm( c ){
    c['merged'] = false
    c['total'] -= this.summary[this.vcmAfil]['C']['total']
    c['vcmItems'] = []
    this.summary[this.vcmAfil]['C']['mergedVcm'] = false
    this.mergeSel = false
  }

  resetAll( f = false ){
    this.summary = {}
    this.mergeFlag = false
    this.mergeSel = false
    this.vcmAfil = null
    this.links = []

    for( let i of this.items ){
      i['checked'] = false
    }

    if( f ){
      this.loading = false
      this.ml = null
      this.mlInfo = null
      this.flagDif = false
      this.newData = null
      this.data = []
      this.items = []
    }
  }

  deactivate( i ){

    let params = {
      reference: i['deactivateLnk'],
      mlTicket: this.data['master']['mlTicket']
    }

    this.loading = true

    this._api.restfulPut( params, 'Pagos/deactivateLink' )
                .subscribe( res => {

                  this.loading = false
                  i['deactFlag'] = false
                  this.reloadFull.emit(true)

                }, err => {
                  this.loading = false;

                  this.loading = false
                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  sendLinks(){

    let links = []

    for( let af in this.summary ){
      if( this.summary.hasOwnProperty(af) ){

        for( let p in this.summary[af] ){
          if( this.summary[af].hasOwnProperty(p) ){

            let t = this.summary[af][p]

            if( t['status'] == 2 ){
              let arr = JSON.parse(JSON.stringify(t))

              delete arr.status
              delete arr.merged

              if( t['vcmItems'] ){
                for( let v of t['vcmItems'] ){
                  arr.items.push(v)
                }

                delete arr.vcmItems
              }

              links.push(arr)
            }

          }
        }

      }

    }

    console.log(this.summary)
    console.log(links)
  }

  copyToClipboard( t ) {

    let d = $('<input>').val(t).appendTo('body').select()
    document.execCommand('copy')

  }

}
