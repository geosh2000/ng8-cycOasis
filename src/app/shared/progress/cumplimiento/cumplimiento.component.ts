import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cumplimiento',
  templateUrl: './cumplimiento.component.html',
  styles: []
})
export class CumplimientoComponent implements OnInit {

  @Input() config:Object = {
    border: '',
    var:    '',
    val:    ''
  }

  constructor() { }

  ngOnInit() {
  }

}
