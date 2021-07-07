import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/service.index';

declare var jQuery: any;

@Component({
  selector: 'app-cotiza-pax',
  templateUrl: './cotiza-pax.component.html',
  styleUrls: ['./cotiza-pax.component.css']
})
export class CotizaPaxComponent implements OnInit {

  loading = {}
  viewPricesData = {
    'categoria': '',
    'hotel': '',
  }

  constructor(public _api: ApiService, public toastr: ToastrService) { }

  ngOnInit() {
  }

  viewPricesLoad(i){
    this.loading['viewPrices'] = true

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

}
