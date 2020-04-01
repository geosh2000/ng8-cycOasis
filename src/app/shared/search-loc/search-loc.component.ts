import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-loc',
  templateUrl: './search-loc.component.html',
  styles: []
})
export class SearchLocComponent implements OnInit {

  @Output() selected = new EventEmitter()
  @Input() maxHeight:any = 900


  mail:any
  loading:Object = {
  }
  data:any = []
  noResults = false

  constructor(public _api: ApiService,
              private orderPipe: OrderPipe,
              public toastr: ToastrService) {
                }

  ngOnInit() {
  }

  search(){

    this.loading['search'] = true;
    this.noResults = false


    this._api.restfulPut( {val: this.mail}, 'Rsv/searchLoc' )
                .subscribe( res => {

                  this.loading['search'] = false;
                  let result = res['data']
                  result = this.orderPipe.transform(result, 'masterlocatorid')

                  this.data = result
                  if( this.data.length == 0 ){
                    this.noResults = true
                  }

                }, err => {
                  this.loading['search'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  select( i ){
    this.selected.emit( i )
    this.mail = ''
    this.data= []
  }


}
