import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cot-hab-detail',
  templateUrl: './cot-hab-detail.component.html',
  styles: [`
  .mat-radio-button ~ .mat-radio-button {
    margin-left: 16px;
  }
  .mat-l3 {
    background-color: #bb9e11;
    color: white;
  }
  .mat-l4 {
    background-color: #b360bd;
    color: white;
  }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CotHabDetailComponent implements OnInit {

  @Output() total = new EventEmitter<any>()
  @Input() habs:any = []
  @Input() moneda = true
  @Input() paymentSelect = false
  @Input() level = '2'
  @Input() gpo = ''

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
