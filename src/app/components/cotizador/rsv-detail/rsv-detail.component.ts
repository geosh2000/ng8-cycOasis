import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-rsv-detail',
  templateUrl: './rsv-detail.component.html',
  styleUrls: ['./rsv-detail.component.css']
})
export class RsvDetailComponent implements OnInit {

  @Output() total = new EventEmitter<any>()
  @Input() habs:any = []
  @Input() moneda = true
  @Input() paymentSelect = false
  @Input() level = '2'

  constructor() {
    this.total.emit(0)
  }

  ngOnInit() {
  }

  calcTotal(){
    let t = 0
    for ( let i of this.habs ){
      if( i['fdp'] ){
        let m = this.level == '2' ? i['MXN_total'] : i['l' + this.level + 'MXN_total']
        let u = this.level == '2' ? i['USD_total'] : i['l' + this.level + 'USD_total']
        t += parseFloat( i['fdp'] == 1 ? (this.moneda ? i['l' + this.level + 'MXN_total'] : i['l' + this.level + 'USD_total']) : (this.moneda ? m : u) )
      }
    }

    this.total.emit(t)
  }

}

