import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, InitService } from 'src/app/services/service.index';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-print-voucher',
  templateUrl: './print-voucher.component.html',
  styleUrls: ['./print-voucher.component.css']
})
export class PrintVoucherComponent implements OnInit {

  operation:any
  viewLoc:any
  data:Object = {}
  loading:Object = {}

  constructor( public _api: ApiService,
               public _init: InitService,
               private activatedRoute: ActivatedRoute,
               public toastr: ToastrService ) { 
                this.activatedRoute.params.subscribe( params => {
                  if ( params.op ){
                    this.operation = params.op;
                    this.getVoucher( params.op )
                  }
                });
               }

  ngOnInit() {
  }

  getVoucher( op ){

    this.loading['voucher'] = true;

    this._api.restfulGet( op, 'Calls/getVoucher' )
                .subscribe( res => {

                  this.loading['voucher'] = false;

                  this.data = res['data']

                }, err => {
                  this.loading['voucher'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  public exportPdf(){
    let data = document.getElementById('contentToExport')

    html2canvas(data).then(canvas => {
      // Few necessary setting options
      let imgWidth = 208;
      let pageHeight = 295;
      let imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf('p', 'mm', 'a4'); 
      let position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position)
      // pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      pdf.save(this.data['referencia'] + ' voucher.pdf');

    });
  }

}
