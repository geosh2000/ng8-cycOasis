import { Component, OnInit } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from 'src/app/services/service.index';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-robin-queues',
  templateUrl: './robin-queues.component.html',
  styles: []
})
export class RobinQueuesComponent implements OnInit {

  currentUser: any;
  showContents = false;
  mainCredential = 'rrobin_queues';

  loading:Object = {}

  qConfigStatus = []
  queues = []

  constructor(public _api: ApiService,
    public _init: InitService,
    private titleService: Title,
    private _tokenCheck: TokenCheckService,
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
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - RRobin Config Queues');

    this.getQueues()
  }

  getQueues(){
    this.loading['queues'] = true

    this._api.restfulGet( '', 'Rrobin/rrQueues' )
                .subscribe( res => {

                  this.loading['queues'] = false;

                  let r = res['data']

                  for( let a of r ){
                    a['qArr'] = {}
                    let tmpArr = a['queues'].split(',')
                    for( let ta of tmpArr ){
                      a['qArr'][ta] = true
                    }
                  }

                  this.qConfigStatus = r
                  this.queues = res['queues']

                }, err => {
                  this.loading['queues'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  qConv(arr, q, e){

    arr['loading'] = true
    
    let r = ','
    for( let qs of this.queues ){
      if( qs['id'] == q ){
        if( e ){
          r += `${q},`
        }
      }else{
        if( arr['qArr'][qs['id']] ){
          r += `${qs['id']},`
        }
      }
    }

    r += ','

    arr['queues'] = r

    

    this._api.restfulPut( {qs: r, asesor: arr['asesor']}, 'Rrobin/setQueue' )
                .subscribe( res => {

                  arr['loading'] = false;

                  this.toastr.success(`Cola ${q} ${e ? 'habilitada' : 'deshabilitada'} para agente ${arr['Agente']}`,'Completado')

                }, err => {
                  arr['loading'] = false;

                  arr['qArr'][q] = !e
                  let r = ','
                  for( let qs of this.queues ){
                    if( qs['id'] == q ){
                      if( !e ){
                        r += `${q},`
                      }
                    }else{
                      if( arr['qArr'][qs['id']] ){
                        r += `${qs['id']},`
                      }
                    }
                  }

                  r += ','

                  arr['queues'] = r

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
