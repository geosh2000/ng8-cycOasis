import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { DetalleAsesoresComponent } from './components/hc/detalle-asesores/detalle-asesores.component';
import { CargaHorariosComponent } from './components/asistencia/carga-horarios/carga-horarios.component';
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { CotizadorV2Component } from './components/cotizador/cotizador-v2.component';
import { CcSuperAssignComponent } from './components/config/cc-super-assign/cc-super-assign.component';
import { RsvManageComponent } from './components/rsv/rsv-manage/rsv-manage.component';
import { AddExternalUserComponent } from './components/config/add-external-user/add-external-user.component';
import { PrintVoucherComponent } from './components/pagos/print-voucher/print-voucher.component';
import { RsvListComponent } from './components/rsv/rsv-list/rsv-list.component';
import { RsvPaymentListComponent } from './components/rsv/rsv-payment-list/rsv-payment-list.component';
import { CieloListComponent } from './components/cielo/cielo-list/cielo-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RsvDayPassListComponent } from './components/rsv/rsv-day-pass-list/rsv-day-pass-list.component';
import { ChatMonitorComponent } from './components/chat/chat-monitor.component';
import { TelefoniaComponent } from './components/monitores/telefonia/telefonia.component';
import { CallStatisticsComponent } from './components/monitores/calls/call-statistics.component';
import { TestComponent } from './components/test/test.component';
import { MainCotizadorComponent } from './components/cotizador/main-cotizador.component';
import { Rsv2ManageComponent } from './components/rsv2/rsv2-manage/rsv2-manage.component';
import { ExtranetComponent } from './components/extranet/extranet.component';
import { ExtranetListComponent } from './components/extranet/extranet-list/extranet-list.component';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { UploadFilesComponent } from './config/upload-files/upload-files.component';
import { DataStudioComponent } from './components/data-studio/data-studio.component';
import { WhatsappTemplatesComponent } from './config/whatsapp-templates/whatsapp-templates.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  { path: 'chat', component: ChatMonitorComponent },

  { path: 'home', component: HomeComponent },
  { path: 'detalle-asesores', component: DetalleAsesoresComponent },
  { path: 'detalle-asesores/:id', component: DetalleAsesoresComponent },
  { path: 'detalle-asesores/:id/:tipo', component: DetalleAsesoresComponent },

  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'asistencia/editarHorarios', component: CargaHorariosComponent },

  { path: 'config/addExternal', component: AddExternalUserComponent },

  { path: 'cotizador', component: MainCotizadorComponent },
  // { path: 'cotizadorV2', component: CotizadorV2Component },

  { path: 'dashboard', component: DashboardComponent },

  { path: 'boards', component: DataStudioComponent },

  { path: 'monitores/telefonia', component: TelefoniaComponent },
  { path: 'monitores/telefonia/:a', component: TelefoniaComponent },
  { path: 'monitores/callStatistics', component: CallStatisticsComponent },

  // RSV 2
  { path: 'rsv2', component: Rsv2ManageComponent },
  { path: 'rsv2/:loc', component: Rsv2ManageComponent },

  // Extranet
  { path: 'extranet', component: ExtranetComponent },
  { path: 'extranetList', component: ExtranetListComponent },
  { path: 'extranet/:loc', component: ExtranetComponent },

  // OLD RSV
  { path: 'rsv', component: RsvManageComponent },
  { path: 'rsv/:loc', component: RsvManageComponent },
  { path: 'rsvList', component: RsvListComponent },
  { path: 'rsvPaymentList', component: RsvPaymentListComponent },
  { path: 'dayPassList', component: RsvDayPassListComponent },

  { path: 'cieloList', component: CieloListComponent },

  { path: 'config/chgSuperCC', component: CcSuperAssignComponent },

  { path: 'geosh/test', component: TestComponent },

  { path: 'whatsapp', component: WhatsappComponent },
  { path: 'whatsapp/:ticket', component: WhatsappComponent },

  { path: 'uploads', component: UploadFilesComponent },
  { path: 'uploads/:param', component: UploadFilesComponent },

  { path: 'templates', component: WhatsappTemplatesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})

export class AppRoutingModule {}
