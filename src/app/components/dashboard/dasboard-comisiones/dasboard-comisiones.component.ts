import { Component, OnInit, Input } from '@angular/core';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';
import { ApiService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dasboard-comisiones',
  templateUrl: './dasboard-comisiones.component.html',
  styles: []
})
export class DasboardComisionesComponent implements OnInit {

  @Input() asesor = 0
  @Input() dashboard = false

  config:EasyTableServiceService
  columns:any = [
    { type: 'npropio', key: 'nombre', title: 'Nombre' },
    { type: 'money', key: 'montoArr', title: 'Monto' },
    { type: 'money', key: 'montoArrLimpio', title: 'Monto sin Impuestos' },
    { type: 'money', key: 'comision', title: 'Comisión' }
  ]

  loading = {}
  data:any = []

  constructor(public _api: ApiService,
              public toastr: ToastrService) { }

  ngOnInit() {
    this.config = EasyTableServiceService.config
    this.config['paginationEnabled'] = false
    this.config['rows'] = 100
    this.config['paginationRangeEnabled'] = false
    this.config['searchEnabled'] = false
    if( this.dashboard ){
      this.columns.push({ type: 'money', key: 'comisionGte', title: 'Comisión Gerente' })
    }
    this.getData( )
  }

  getData( a? ) {

    this.loading['comisiones'] = true;


    this._api.restfulGet( a ? a : this.asesor, 'Dashboard/comisiones' )
                .subscribe( res => {

                  this.loading['comisiones'] = false;
                  this.data = res['data']

                }, err => {
                  this.loading['comisiones'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
