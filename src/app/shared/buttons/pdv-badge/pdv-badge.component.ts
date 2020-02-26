import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pdv-badge',
  templateUrl: './pdv-badge.component.html',
  styles: [`.btn-morado { background: indigo; color: white }`]
})
export class PdvBadgeComponent implements OnInit {

  @Input() btnWidth:number = 100
  @Input() date:any
  @Input() dataAsesor:Object

  btnClass:string = ''
  displayText:string = ''

  infoDisplay:boolean = false
  infoExcep:boolean = false
  infoData:Object

  constructor() {

  }
  ngOnInit() {
  }

}
