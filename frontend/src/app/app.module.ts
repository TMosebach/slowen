import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundPageComponent } from './core/not-found-page/not-found-page.component';
import { NavigationComponent } from './core/navigation/navigation.component';
import { StartPageComponent } from './core/start-page/start-page.component';
import { BuchhaltungModule } from './features/buchhaltung/buchhaltung.module';
import { ReportingModule } from './features/reporting/reporting.module';
import { VerwaltungModule } from './features/verwaltung/verwaltung.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundPageComponent,
    NavigationComponent,
    StartPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,

    BuchhaltungModule,
    ReportingModule,
    VerwaltungModule,

    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
