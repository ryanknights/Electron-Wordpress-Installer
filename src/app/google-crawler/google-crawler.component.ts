import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';

declare var electron:any;

@Component({
  selector: 'google-crawler',
  templateUrl: './google-crawler.component.html',
  styleUrls: ['./google-crawler.component.css']
})
export class GoogleCrawlerComponent implements OnInit {

  ipcRenderer = electron.ipcRenderer;
  remote      = electron.remote;

  message: string = '';
  options: any = {};
  results: string = '';

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
	this.ipcRenderer.on('crawlMessage', (event, message) =>
	{
		this.message = message;
		this.ref.detectChanges();
	});

	this.ipcRenderer.on('crawlComplete', (event, results) =>
	{
		this.results           = results.join('\n');
		this.message           = `Crawl complete, found ${results.length} results`;
		this.options.directory = '';

		this.ref.detectChanges();
	});  	
  }

	chooseDirectory () {
		this.remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory']}, (folder) =>
		{
			this.options.directory = folder[0];
			this.ref.detectChanges();
		});	
	}

	crawlGoogle ({value, valid}) {
		this.ipcRenderer.send('crawlGoogle', value);
	}  
}