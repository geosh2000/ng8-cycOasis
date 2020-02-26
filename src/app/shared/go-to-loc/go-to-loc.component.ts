import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-go-to-loc',
  templateUrl: './go-to-loc.component.html',
  styleUrls: ['./go-to-loc.component.css']
})
export class GoToLocComponent implements OnInit {

  value:any

  constructor(public router: Router) { }

  ngOnInit() {
  }

  goTo( v ){
    this.router.navigate(['/rsv2',v]);
    // tslint:disable-next-line: no-unused-expression
    this.value = ''
  }

}
