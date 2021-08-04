import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';
import { EditPrepayComponent } from '../edit-prepay/edit-prepay.component';

declare var jQuery: any;

@Component({
  selector: 'app-cotiza-pax',
  templateUrl: './cotiza-pax.component.html',
  styleUrls: ['./cotiza-pax.component.css']
})
export class CotizaPaxComponent implements OnInit {

  @Output() saveOpen = new EventEmitter()
  @ViewChild(EditPrepayComponent,{static:false}) _epp:EditPrepayComponent;

  loading = {}
  original = {}
  changes = {}
  viewPricesData = {
    'categoria': '',
    'hotel': '',
  }

  constructor(public _api: ApiService, public toastr: ToastrService, public _init: InitService) { }

  ngOnInit() {
  }

  viewPricesLoad(arr){
    this.loading['viewPrices'] = true
    let i = arr['itemId']

    // Original data
    this.original = JSON.parse(JSON.stringify(arr))
    this.changes = {}

    jQuery('#viewPrices').modal('show')

    this._api.restfulPut( {itemId: i}, 'Rsv/cotizaPax' )
                .subscribe( res => {

                  this.loading['viewPrices'] = false;
                  this.viewPricesData = res['data']

                }, err => {
                  this.loading['viewPrices'] = false;
                  jQuery('#viewPrices').modal('hide')

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  apply(p,a,j,m){
    // console.log('precio',p)
    // console.log('adultos',a)
    // console.log('juniors',j)
    // console.log('menores',m)

    this.changes = {
      'adultos': a,
      'juniors': j,
      'menores': m,
    }

    this.saveChanges(p, this.changes)
  }

  close(){
    jQuery('#viewPrices').modal('hide')
  }

  n(n){
    return parseFloat(n)
  }

  saveChanges( p, c ){
    this.loading['applying'] = true

    let mdfFields = [
      ['adultos','adultos'],
      ['juniors','juniors'],
      ['menores','menores'],
    ]

    let chgs = []
    let fields = ''
    let newData = {}
    let oldData = {}
    let msgOld = 'Antes: '
    let msgNew = 'Ahora: '

    for( let f of mdfFields ){
      console.log(f[0], this.original[f[0]], c[f[0]], this.original[f[0]] != c[f[0]])
      if( this.original[f[0]] != c[f[0]] ){
        chgs.push(f[0])
        fields += `, ${f[0]}`
        newData[f[1]] = c[f[0]]
        oldData[f[0]] = this.original[f[0]]
        msgOld += `, ${f[0]}: ${this.original[f[0]]}`
        msgNew += `, ${f[0]}: ${c[f[0]]}`
      }
    }

    if( chgs.length == 0 ){
      this.toastr.error('No cambios', 'No se detectaron cambios')
      this.loading['applying'] = false
      return true
    }

    let params = {
      newData,
      oldData,
      itemId: this.original['itemId'],
      item: this.original['itemLocatorId'],
      mlTicket: this.original['mlTicket'],
      msg: `Cambios aplicados. ${msgOld} ||${msgNew} por: `
    }

    this._api.restfulPut( params, 'Rsv/setChanges' )
                .subscribe( res => {

                  // this.loading['applying'] = false;
                  this.toastr.success('Cambios detectados', `Se detectaron ${chgs.length} cambios... ${fields}`)
                  this._epp.editTotalMonto(p,'Cambio desde cotizador de pax', true, this.original) 

                }, err => {
                  this.loading['applying'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  montoDone(e){
    this.toastr.success('Monto modificado', 'Cambio completado');
    
    (async () => { 

        await this.delay(1000);
        this.close()
        this.saveOpen.emit( true )
        this.loading['applying'] = false;
    })();
    
    
  }

  showError(){
    this.toastr.error( "Cambio de tarifa no aplicado, debes ingresarla manualmente", "ERROR AL CAMBIAR TARIFA" );
    this.loading['applying'] = false;
    this.close()
    this.saveOpen.emit( false )
  }

}
