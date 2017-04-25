import { ElectronWordpressInstallerPage } from './app.po';

describe('electron-wordpress-installer App', () => {
  let page: ElectronWordpressInstallerPage;

  beforeEach(() => {
    page = new ElectronWordpressInstallerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
