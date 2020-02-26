import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { InitService, ApiService, TokenCheckService } from 'src/app/services/service.index';
import { Router } from '@angular/router';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { OrderPipe } from 'ngx-order-pipe';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { CreateRsvComponent } from '../create-rsv/create-rsv.component';

@Component({
  selector: 'app-cot-create-rsv',
  templateUrl: './cot-create-rsv.component.html',
  styleUrls: ['./cot-create-rsv.component.css']
})
export class CotCreateRsvComponent implements OnInit {

  @ViewChild(CreateRsvComponent, {static: false}) _create:CreateRsvComponent

  data:Object = {
    data: {},
    moneda: true
  }

  lastLocCreated:any
  linkTicket:any = []
  linkedTicket:any
  flagManage = false
  flagSearchTicket = false
  updateTicket:Object = {ticket: ''}
  lTicket = ''
  linkedTicketFlag

  loading:Object = {}

  // tslint:disable-next-line: no-output-native
  @Output() end = new EventEmitter<any>()

  constructor(public _api: ApiService,
              private nbConfig: NgbDatepickerConfig,
              private route: Router,
              public _init: InitService,
              private titleService: Title,
              private _tokenCheck: TokenCheckService,
              private orderPipe: OrderPipe,
              private sanitization:DomSanitizer,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  rsvError( e ){
    this.toastr.error(e, 'ERROR!')
  }

  endRsv( e ){
    // via:phone type:ticket status:open order_by:created sort:desc created>2019-07-17 asignee:
    this.lastLocCreated = e['masterlocator']
    this.lTicket = ''
    this.flagManage = false
    this.linkedTicketFlag = false
    this.flagSearchTicket = false
    this.getCallTicket(e['items'])
    jQuery('#confirmRsv').modal('show')
  }

  getCallTicket( e, t? ){
    this.loading['callTicket'] = true;

    let asignee = this._init.currentUser['hcInfo']['zdId']
    let date = moment().subtract(2,'days').format('YYYY-MM-DD')

    let query = t ? t : `via:phone type:ticket status:open order_by:created sort:desc created>${date}T00:00:00Z assignee:${asignee}`
    let params = {
        query
      };

    this._api.restfulPut( params, 'Calls/searchZdQuery' )
                .subscribe( res => {

                  this.loading['callTicket'] = false;

                  let results = {}

                  if( t ){
                    for(let r of res['data']['results']){
                      if( r['id'] == t ){
                        results = [r]
                        break
                      }
                    }
                  }else{
                    results = res['data']['results'][0] ? [res['data']['results'][0]] : []
                  }

                  this.linkTicketProc( results, e == null ? this.updateTicket['tickets'] : e, t ? true : false )

                }, err => {
                  this.loading['callTicket'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  linkTicketProc( results, e, f = false ){
    let ticket = ''
    let update = {
      ml: this.lastLocCreated,
      tickets: e,
      ticket: ''
    }

    if( results.length > 0 ){
      ticket = results[0]['id']
      this.linkedTicket = `${ticket} (${results[0]['subject']})`
      update['ticket'] = ticket
      this.flagSearchTicket = false
    }else{
      if( f ){
        this.toastr.error( 'No se encontró el ticket', 'Error' );
      }

      this.flagSearchTicket = true
    }

    this.linkedTicketFlag = false
    this.updateTicket = update
  }

  linkTickets(){
    this.loading['linkingTicket'] = true;

    this._api.restfulPut( this.updateTicket, 'Rsv/linkTicket' )
                .subscribe( res => {

                  this.loading['linkingTicket'] = false;
                  this.flagManage = true
                  this.linkedTicketFlag = true
                }, err => {
                  this.loading['linkingTicket'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  omitLink(){
    this.flagSearchTicket = false
    this.flagManage = true
    this.linkedTicketFlag = true
  }

  chgTicketLink(){
    this.flagSearchTicket = true
    this.flagManage = false
    this.linkedTicketFlag = false
  }

  viewRsv(){
    this.route.navigateByUrl(`/rsv2/${this.lastLocCreated}`);
  }

  popReserve( h ){
    this._create.popReserve(h)
  }
}
