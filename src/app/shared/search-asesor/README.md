# Completer ComeyCome

## Uso

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<app-search-asesor (result)="print( $event )" [currentUser]="currentUser" [active]="1" placeholder="No Filter" ></app-search-asesor>
  <app-search-asesor (result)="print( $event )" [currentUser]="currentUser" [active]="1" placeholder="UDN MP"    [udn]="1"></app-search-asesor>
  <app-search-asesor (result)="print( $event )" [currentUser]="currentUser" [active]="1" placeholder="UDN MT"    [udn]="2"></app-search-asesor>
  <app-search-asesor (result)="print( $event )" [currentUser]="currentUser" [active]="1" placeholder="UDN Apoyo" [udn]="3"></app-search-asesor>
  <app-search-asesor (result)="print( $event )" [currentUser]="currentUser" [active]="1" placeholder="SELF"      [udn]="'self'"></app-search-asesor>
  <app-search-asesor (result)="print( $event )" [currentUser]="currentUser" [active]="2" placeholder="PDV"       [area]="3"></app-search-asesor>`
})
export class MyComponent {

  currentUser:any

  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
  }

  print( event ){
    console.log( event )
  }
}
```

## API

### app-search-asesor component

|Attribute|Description|Type|Required|Default|
|:---    |:---        |:--- |:---      |:--- |
|currentUser|Contiene la información de token y *hcInfo* del usuario|Object|Yes||
|field|El campo sobre el que se realizará la búsqueda|string|No|'Nombre'|
|placeholder| Texto que se mostrara en el *placeholder* del Input |string|No|'Buscar Asesor...'|
|iconPosition| Posición del ícono: *left* \| *right* |string|No|'right'|
|active|Filtro de usuarios: 0: Inactivos \| 1: Activos \| 2: Todos |number|No|2
|udn|Determina si se aplicar un filtro sobre la UdN. NULL no aplica filtro \| Array y Number Aplica filtro mostrando solo el id selecionado. String "SELF" Muestra los mismos codigos. | *null* \| Array<number> \| number \| string |No|null
|area|Determina si se aplicar un filtro sobre el Area. NULL no aplica filtro \| Array y Number Aplica filtro mostrando solo el id selecionado. String "SELF" Muestra los mismos codigos. | *null* \| Array<number> \| number \| string |No|null|
|dep|Determina si se aplicar un filtro sobre el Departamento. NULL no aplica filtro \| Array y Number Aplica filtro mostrando solo el id selecionado. String "SELF" Muestra los mismos codigos. | *null* \| Array<number> \| number \| string |No|null|
|puesto|Determina si se aplicaráá un filtro sobre el Puesto. NULL no aplica filtro \| Array y Number Aplica filtro mostrando solo el id selecionado. String "SELF" Muestra los mismos codigos. | *null* \| Array<number> \| number \| string |No|null|
|overrideAllAgents|Si cuenta con la licencia "view_all_agents", no mostrará más que los seleccionados en la configuración | BOOLEAN |No| FALSE |

### app-search-asesor events

|Name|Description|Type|
|:---    |:---        |:--- |
|result|Se emite al seleccionar un item|(event: Object): void|
