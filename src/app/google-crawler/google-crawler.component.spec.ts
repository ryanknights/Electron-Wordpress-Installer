import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleCrawlerComponent } from './google-crawler.component';

describe('GoogleCrawlerComponent', () => {
  let component: GoogleCrawlerComponent;
  let fixture: ComponentFixture<GoogleCrawlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleCrawlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleCrawlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
