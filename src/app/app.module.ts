import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Routes, RouterModule } from '@angular/router';
import { routing } from './app.routing';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { InstallComponent } from './install/install.component';
import { GoogleCrawlerComponent } from './google-crawler/google-crawler.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InstallComponent,
    GoogleCrawlerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
