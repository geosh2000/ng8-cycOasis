import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cot-hab-detail',
  templateUrl: './cot-hab-detail.component.html',
  styleUrls: ['./cot-hab-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CotHabDetailComponent implements OnInit {

  @Output() total = new EventEmitter<any>()
  @Input() habs:any = []
  @Input() moneda = true
  @Input() paymentSelect = false
  @Input() level = '2'
  @Input() gpo = ''
  @Input() paq = {}
  @Input() showPaq = false
  @Input() occ = {}

  constructor() {
    this.total.emit(0)
  }

  ngOnInit() {
  }

  calcTotal( e = this.level ){

    let level = this.level

    if( e != this.level ){
      level = e['value']
    }

    let t = 0
    for ( let i of this.habs ){
      if( i['bedPreference'] ){
        let m = level == '2' ? i['MXN_total'] : i['l' + level + 'MXN_total']
        let u = level == '2' ? i['USD_total'] : i['l' + level + 'USD_total']
        t += parseFloat( i['fdp'] == 1 ? (this.moneda ? i['l' + level + 'MXN_total'] : i['l' + level + 'USD_total']) : (this.moneda ? m : u) )
      }
    }

    this.total.emit(t)
  }

}
