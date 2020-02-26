import { Component, OnInit, OnDestroy } from '@angular/core';

import * as moment from 'moment-timezone';
import { ApiService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';
import { OrderPipe } from 'ngx-order-pipe';

@Component({
  selector: 'app-tel-agent',
  templateUrl: './tel-agent.component.html',
  styles: [`


  .mat-flash {
     -webkit-animation: flash linear 1s infinite;
     animation: flash linear 1s infinite;
     background-color: #9c1414;
        color: #fff;
   }

   @-webkit-keyframes flash {
  	0% { opacity: 1; }
  	50% { opacity: .1; }
  	100% { opacity: 1; }
  }

  @keyframes flash {
  	0% { opacity: 1; }
  	50% { opacity: .1; }
  	100% { opacity: 1; }
  }


    .example-card {
      max-width: 400px;
    }

    .scale {
      zoom: 160%
    }

    .example-header-image {
      background-size: cover;
    }
    .mat-call {
      background-color: #8bc34a;
      color: 'black';
    }
    .mat-pause {
      background-color: #f1d449;
      color: 'black';
    }
    .mat-avail {
      background-color: #efefef;
      color: 'black';
    }
    .mat-unavail {
      background-color: #7e8184;
      color: #bfbcb8;
    }
    .mat-wrap {
      background-color: #71c4ff;
      color: 'black';
    }

    .mat-danger {
      background-color: #9c1414;
      color: #fff;
    }

    .mat-card-avatar{
      height: 100px;
      width: 100px;
      border-radius: 25%;
    }
  `]
})
export class TelAgentComponent implements OnInit, OnDestroy {

  data = []
  wa = {}
  lu = 'waiting...'

  loading = {}
  timeout:any

  tps = {
    status: ['talkStatus','current_queue_activity'],
    agStatus: ['talkAgentStatus','agents_activity'],
    agOverview: ['talkAgentOverview','agents_overview'],
    stOverview: ['talkStatsOverview','account_overview']
  }

  constructor( public _api: ApiService,
               private _ord: OrderPipe,
               public toastr: ToastrService ) {
 }

  ngOnInit() {
    this.getData('agStatus' )
  }

  ngOnDestroy() {
    clearTimeout(this.timeout)
  }

  getData( tp ) {

    this.loading['data'] = true;

    this._api.restfulGet( '', `Calls/${this.tps[tp][0]}` )
                .subscribe( res => {

                  this.loading['data'] = false;
                  let data = []

                  // tslint:disable-next-line: forin
                  for( let f of res['data']['data'][this.tps[tp][1]]){
                    f['whatsapp'] = res['date']['wa'][f['agent_id']] ? res['date']['wa'][f['agent_id']] : {}
                    data.push(f)
                  }

                  data = this._ord.transform(data,'name')
                  this.data = data
                  this.lu = moment(res['date']['lu']).format('DD/MMM HH:mm:ss')
                  console.log(this.data)
                  this.timeout = setTimeout( () => this.getData('agStatus' ), 2000 )

                }, err => {
                  this.loading['data'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                  this.timeout = setTimeout( () => this.getData('agStatus' ), 2000 )

                });
  }

  timePrint( s ){
    let duration = moment.duration(s, 'seconds');
    return duration.format('HH:mm:ss');
  }

  printVal( f, g ){

    if( typeof g === 'object' ){
      return JSON.stringify(g)
    }

    if( f.match(/time/g) || f.match(/duration/g) ){
      let r = moment.duration(g, 'seconds')
      let hours:any = Math.floor(r.asHours())
      let minutes:any = Math.floor(r.asMinutes()) - ( hours * 60 )
      let seconds:any = Math.floor(r.asSeconds()) - ( Math.floor(r.asMinutes()) * 60 )

      if( hours < 10 ){ hours = `0${ hours }` }
      if( minutes < 10 ){ minutes = `0${ minutes }` }
      if( seconds < 10 ){ seconds = `0${ seconds }` }

      return `${ hours }:${ minutes }:${ seconds }`

    }else{
      return g
    }
  }

  bgStatus( s ){
    switch(s['agent_state']){
      case 'online':
        switch(s['call_status']){
          case null:
            return 'mat-avail'
          case 'on_call':
            return 'mat-call'
          case 'wrap_up':
            return 'mat-wrap'
        }
        break
      case 'offline':
        return 'mat-unavail'
      case 'away':
        return 'mat-pause'
    }
  }

}
