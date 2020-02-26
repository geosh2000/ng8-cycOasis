import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-hotel-module',
  templateUrl: './search-hotel-module.component.html',
  styles: []
})
export class SearchHotelModuleComponent implements OnInit {

  @Input() noHab = 1

  adults = 1
  min = 0
  e1 = 0
  e2 = 0
  e3 = 0

  constructor() { }

  ngOnInit() {
  }

}
