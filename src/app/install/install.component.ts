import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

declare var electron:any;
declare var remote:any;

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.css']
})
export class InstallComponent implements OnInit {

  ipcRenderer = electron.ipcRenderer;
  remote      = electron.remote;
  installationFolder: string = '';
  installationMessage: string = '';

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
  	this.ipcRenderer.on('installationMessage', (event, message) =>
  	{
  		this.installationMessage+= message;
  		this.ref.detectChanges();
  	});

  	this.ipcRenderer.on('installationComplete', (event, success) =>
  	{
  		if (success)
  		{
  			alert('Installation complete');
  		}
  		else
  		{
  			alert('There was a problem installing');
  		}
  		
  		this.installationMessage = '';
  		this.ref.detectChanges();
  	});  	
  }

  chooseDirectory () {
  	this.remote.dialog.showOpenDialog({ properties: ['openDirectory']}, (folder) =>
	{
		this.installationFolder = folder[0];
  		this.ref.detectChanges();
	});	
  }

  installWordpress () {
  	this.ipcRenderer.send('installWordpress', this.installationFolder);
  }
}
