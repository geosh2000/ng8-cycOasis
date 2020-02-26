import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizado'
})
export class CapitalizadoPipe implements PipeTransform {

  transform(value: string, todas:boolean = true ): string {

    value = value.trim().toLowerCase();

    let nombres = value.split(' ');
    let result = ''

    if( todas ){
      // tslint:disable-next-line: forin
      for( let i in nombres ){
        nombres[i] = nombres[i][0].toUpperCase() + nombres[i].substr(1);
      }

      result = nombres.join(' ').replace('_',' ');
    }else{
      // nombres[0] = nombres[0][0].toUpperCase() + nombres[0].substr(1);
      value = value.toLowerCase().replace(/\b[a-z]/g, (letter) => {
          return letter.toUpperCase();
      });

      result = value
    }
    return result

  }
}
