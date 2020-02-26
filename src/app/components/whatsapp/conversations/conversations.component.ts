import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { InitService } from 'src/app/services/init.service';
import { TokenCheckService } from 'src/app/services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';


declare var jQuery: any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {

  @Input() agentId:any
  @Output() setTicket = new EventEmitter<any>()
  @Output() reloadTkt = new EventEmitter<any>()
  tickets:any = []
  loading:Object = {}
  selected:any = 0
  timeout:any

  ticketSelected:any

  query:any = 'tags:whatsapp_support status<closed assignee:'

  constructor(public _api: ApiService,
              public _init: InitService,
              private _tokenCheck: TokenCheckService,
              private route: Router,
              private orderPipe: OrderPipe,
              private activatedRoute: ActivatedRoute,
              public toastr: ToastrService) { }

  ngOnInit() {
    this.selected = this.agentId
    this.getTickets()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getTickets( s = this.selected, to = true ){

    this.loading['tickets'] = true;

    this._api.restfulGet( s, 'Whatsapp/listConv' )
                .subscribe( res => {

                  this.loading['tickets'] = false;
                  let tktsO = this.orderPipe.transform(res['data'], 'lastMsg')
                  let tkts = this.orderPipe.transform(tktsO, 'lastIsIn',true)
                  // let tkts = res['data']
                  let notif = false
                  let ticketsNot = []
                  for( let t of tkts){
                    if( t['assignee'] == this.agentId && t['lastIsIn'] == '1' && t['soundNotif'] == '0' && t['isRead'] == '0'  ){
                      console.log(t)
                      notif = true
                      ticketsNot.push(t['ticketId'])
                    }

                    if( t['ticketId'] == this.ticketSelected && t['lastIsIn'] == '1' && t['isRead'] == '0' ){
                      this.reloadTkt.emit(this.ticketSelected)
                    }
                  }

                  if( notif ){
                    this.okNotif(ticketsNot)
                  }

                  this.tickets = tkts

                  if( to ){
                    this.timeout = setTimeout( () => {
                      this.getTickets()
                    },10000)
                  }

                }, err => {
                  this.loading['tickets'] = false;

                  if( to ){
                    this.timeout = setTimeout( () => {
                      this.getTickets()
                    },10000)
                  }

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  okNotif( t ){

    this._api.restfulPut( t, 'Whatsapp/soundNotif' )
                .subscribe( res => {

                  console.log('New Notification Done!')

                }, err => {
                  this.loading['tickets'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  clearNotif( t ){

    this._api.restfulPut( t, 'Whatsapp/clearNotif' )
                .subscribe( res => {

                  console.log('New Notification Done!')

                }, err => {
                  this.loading['tickets'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  filterSelect(s){
    this.selected = s
    this.getTickets( s, false )
  }

  formatTime( t, f ){
    if( moment(t) < moment(moment().format('YYYY-MM-DD')) ){
      if( moment(t).format('YYYY-MM-DD') == moment().subtract(1,'days').format('YYYY-MM-DD') ){
        return 'ayer';
      }else{
        return moment(t).format('DD-MMM')
      }
    }

    return moment(t).format(f)
  }

  setConv(id, ag, e){
    this.setTicket.emit(id)
    this.ticketSelected = id
    jQuery('.itemList').removeClass('mOver')
    jQuery('#'+id).addClass('mOver')
    if( ag == this.agentId){
      this.clearNotif(id)
    }
  }

  readTime( t ){
    if( t['readMsg'] == null ){
      return true
    }

    if( moment(t['readMsg']) < moment(t['lastMsg']) ){
      return true
    }

    return false
  }

  mOver( e ){
    jQuery(e.target).addClass('mOver')
  }

  mLeave( e ){
    if( e.target.id != this.ticketSelected ){
      jQuery(e.target).removeClass('mOver')
    }
  }
}