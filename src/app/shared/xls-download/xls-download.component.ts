import { Component, OnInit, Input } from '@angular/core';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;

@Component({
  selector: 'app-xls-download',
  templateUrl: './xls-download.component.html',
  styles: [`
  .mat-cielo {
    background-color: #0cb4da;
    color: #fff;
  }`]
})
export class XlsDownloadComponent implements OnInit {

  @Input() isJs = false
  @Input() tableId = 'table'
  @Input() shName = 'Hoja1'
  @Input() bkName = 'reporte'
  @Input() json = null
  @Input() rawFlag = false
  @Input() title = 'Descargar xls'

  constructor() { }

  ngOnInit() {
  }

  download( isJs, tableId, shName, bkName, json, rawFlag ){
    let wb:any

    wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push(shName);

    if( isJs ){
      let js:any = json ? json : []
      wb.Sheets[shName] = utils.json_to_sheet(js, {cellDates: true});
    }else{
      wb.Sheets[shName] = utils.table_to_sheet(document.getElementById(tableId).getElementsByClassName('ngx-table')[0], {cellDates: true, raw: rawFlag});
    }

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${bkName}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

}
