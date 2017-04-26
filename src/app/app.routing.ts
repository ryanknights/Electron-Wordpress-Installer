import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { InstallComponent } from './install/install.component';

const appRoutes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'install', component: InstallComponent },
	{ path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);