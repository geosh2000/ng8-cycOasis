import { Injectable } from '@angular/core';
import { Config } from 'ngx-easy-table';

@Injectable()
export class EasyTableServiceService {
  public static config: Config = {
    searchEnabled: true,
    headerEnabled: true,
    orderEnabled: true,
    orderEventOnly: false,
    // globalSearchEnabled: true,
    paginationEnabled: false,
    exportEnabled: true,
    clickEvent: false,
    selectRow: false,
    selectCol: false,
    selectCell: false,
    rows: 10000,
    additionalActions: false,
    serverPagination: false,
    isLoading: false,
    detailsTemplate: false,
    groupRows: false,
    paginationRangeEnabled: true,
    collapseAllRows: false,
    checkboxes: false,
    resizeColumn: true,
    fixedColumnWidth: false,
    horizontalScroll: false,
    draggable: false,
    logger: false,
    showDetailsArrow: false,
    showContextMenu: false,
    persistState: false,
    paginationMaxSize: 10,
    tableLayout: {
      style: 'tiny', // or big or tiny
      theme: 'normal', // or dark
      borderless: false,
      hover: true,
      striped: true,
    }
  };
}
