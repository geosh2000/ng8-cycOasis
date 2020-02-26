import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fill'
})
export class FillPipe implements PipeTransform {
  transform(value) {
    let arr =  (new Array(parseInt(value))).fill(2);
  
    return arr;
  }
}
