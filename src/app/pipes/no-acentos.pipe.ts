import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noAcentos'
})
export class NoAcentosPipe implements PipeTransform {

  transform(value: string, upperCase:boolean = true ): string {

    let sustituteLetters = {
      'á': 'a',
      'é': 'e',
      'í': 'i',
      'ó': 'o',
      'ú': 'u',
      'Á': 'A',
      'É': 'E',
      'Í': 'I',
      'Ó': 'O',
      'Ú': 'U'
    }

    let name = value.replace(/[^\w ]/g, function(char) {
        return sustituteLetters[char] || char;
      });

    if(upperCase){
      name = name.toUpperCase()
    }

    return name;
  }

}
