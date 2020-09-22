import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/service.index';

@Component({
  selector: 'app-go-to-loc',
  templateUrl: './go-to-loc.component.html',
  styleUrls: ['./go-to-loc.component.css']
})
export class GoToLocComponent implements OnInit {

  value:any
  loading:Object = {}

  constructor(public router: Router, private _api: ApiService, private toastr:ToastrService) { }

  ngOnInit() {
  }

  goTo( v:String ){

    this.router.navigate(['/rsv2',v]);
    // tslint:disable-next-line: no-unused-expression
    this.value = ''
  }

  searchConf( v:String ){

    if( v.trim().length >= 8 ){

      this.loading['searchLoc'] = true

      this._api.restfulGet( v.trim(), 'Rsv/searchMlByConf' )
                  .subscribe( res => {

                    this.loading['searchLoc'] = false;

                    if( !res['data'] ){
                      this.toastr.error( `La confirmación ${ v.trim() }, no está ligada a ningún MasterLocator`, 'Inexistente' );
                      this.value = ''
                    }else{
                      this.goTo( res['data'] )
                    }
                    

                  }, err => {
                    this.loading['searchLoc'] = false;

                    const error = err.error;
                    this.toastr.error( error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });

    }else{
      this.goTo( v.trim() )
    }

  }

}
