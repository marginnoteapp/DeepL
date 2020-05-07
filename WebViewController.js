var WebViewController = JSB.defineClass('WebViewController : UIViewController', {
  viewDidLoad: function() {
    self.navigationItem.title = 'Web';
    self.lanCode = 'en';
    self.lastOffset = 0;
    var savedLan = NSUserDefaults.standardUserDefaults().objectForKey('marginnote_deepl_lan');
    if(savedLan)self.lanCode = savedLan;

    var webFrame = self.view.bounds;

    self.webView = new UIWebView(webFrame);
    
    self.webView.backgroundColor = UIColor.whiteColor();
    self.webView.scalesPageToFit = true;
    self.webView.autoresizingMask = (1 << 1 | 1 << 4);
    self.webView.delegate = self;
    self.webView.scrollView.delegate = self;
    self.webView.layer.cornerRadius = 15;
    self.webView.layer.masksToBounds = true;
    self.view.layer.shadowOffset = {width:0,height:0};
    self.view.layer.shadowRadius = 10;
    self.view.layer.shadowOpacity = 0.5;
    self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5,1);
    self.view.addSubview(self.webView);
    
    self.webView.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString('http://www.deepl.com/')));

    self.lanButton = UIButton.buttonWithType(0);
    self.lanButton.frame = {x:webFrame.x + 10,y:webFrame.y + webFrame.height - 50,width:80,height:40};
    self.lanButton.autoresizingMask = (1 << 3);
    self.lanButton.setTitleForState('Language',0);
    self.lanButton.setTitleColorForState(Application.sharedInstance().defaultTintColorForDarkBackground,0);
    var highlightColor = UIColor.blendedColor(Application.sharedInstance().defaultTintColorForDarkBackground,Application.sharedInstance().defaultTextColor,0.8);
    self.lanButton.setTitleColorForState(highlightColor,1);
    self.lanButton.backgroundColor = Application.sharedInstance().defaultTextColor.colorWithAlphaComponent(0.6);
    self.lanButton.layer.cornerRadius = 10;
    self.lanButton.layer.masksToBounds = true;
    self.lanButton.titleLabel.font = UIFont.systemFontOfSize(14);
    self.lanButton.addTargetActionForControlEvents(self,'changeLanguage:',1<<6);
    self.view.addSubview(self.lanButton);
    self.updateButton();
  },
  viewWillAppear: function(animated) {
    self.webView.delegate = self;
    self.timer = NSTimer.scheduledTimerWithTimeInterval(3,true,function(timer){
      self.updateOffset();
    });
  },
  viewWillDisappear: function(animated) {
    self.webView.stopLoading();
    self.webView.delegate = null;
    if(self.timer)self.timer.invalidate();

    UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
  },
  viewWillLayoutSubviews: function() {
    self.updateOffset();
  },
  scrollViewDidScroll: function() {
    if(self.webView.scrollView.contentOffset.y != self.lastOffset){
      self.lastOffset = self.webView.scrollView.contentOffset.y;
    }
    else return;
    if(self.timer){
      self.timer.invalidate();
    }
    self.timer = NSTimer.scheduledTimerWithTimeInterval(3,true,function(timer){
      self.updateOffset();
    });
  },
  webViewDidStartLoad: function(webView) {
    UIApplication.sharedApplication().networkActivityIndicatorVisible = true;
    Application.sharedInstance().waitHUDOnView("",self.view);
  },
  webViewDidFinishLoad: function(webView) {
    UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
    self.updateOffset();
    Application.sharedInstance().stopWaitHUDOnView(self.view);

  },
  webViewDidFailLoadWithError: function(webView, error) {
    UIApplication.sharedApplication().networkActivityIndicatorVisible = false;
    Application.sharedInstance().stopWaitHUDOnView(self.view);
  var lan = NSLocale.preferredLanguages().length?NSLocale.preferredLanguages()[0].substring(0,2):'en';

    //var errorString = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\"><html><head><meta http-equiv='Content-Type' content='text/html;charset=utf-8'><title></title></head><body><div style='width: 100%%; text-align: center; font-size: 36pt; color: red;'>An error occurred:<br>%@</div></body></html>";
    //errorString = errorString.replace("%@", error.localizedDescription);
    
    //self.webView.loadHTMLStringBaseURL(errorString, null);
     if(lan == 'zh')
      Application.sharedInstance().showHUD('网页加载失败，请稍后重试',self.view.window,2);
    else
      Application.sharedInstance().showHUD('The page failed to load, please try again later',self.view.window,2);
},
  changeLanguage: function(sender) {
    if(self.popoverController){
      self.popoverController.dismissPopoverAnimated(true);
    }
    var menuController = MenuController.new();
    menuController.commandTable = [ {title:'English',object:self,selector:'changeLanguageTo:',param:'en',checked:(self.lanCode == 'en')},
                                    {title:'Chinese',object:self,selector:'changeLanguageTo:',param:'zh',checked:(self.lanCode == 'zh')},
                                    {title:'German',object:self,selector:'changeLanguageTo:',param:'de',checked:(self.lanCode == 'de')},
                                    {title:'French',object:self,selector:'changeLanguageTo:',param:'fr',checked:(self.lanCode == 'fr')},
                                    {title:'Spanish',object:self,selector:'changeLanguageTo:',param:'es',checked:(self.lanCode == 'es')},
                                    {title:'Russian',object:self,selector:'changeLanguageTo:',param:'ru',checked:(self.lanCode == 'ru')},
                                    {title:'Italian',object:self,selector:'changeLanguageTo:',param:'it',checked:(self.lanCode == 'it')},
                                    {title:'Japanese',object:self,selector:'changeLanguageTo:',param:'ja',checked:(self.lanCode == 'ja')}];
    menuController.rowHeight = 44;
    menuController.preferredContentSize = {width:200,height:menuController.rowHeight * menuController.commandTable.length};
    var studyController = Application.sharedInstance().studyController(self.view.window);
    self.popoverController = new UIPopoverController(menuController);
    var r = sender.convertRectToView(sender.bounds,studyController.view);
    self.popoverController.presentPopoverFromRect(r,studyController.view,1<<1,true);
  },
  changeLanguageTo: function(param) {
    self.lanCode = param;
    self.updateButton();
    NSUserDefaults.standardUserDefaults().setObjectForKey(self.lanCode,'marginnote_deepl_lan');
    self.popoverController.dismissPopoverAnimated(true);
    if(self.text){
      self.translateText(self.text);
    }
  },
});

WebViewController.prototype.translateText = function(text){
    if(!this.webView||!this.webView.window)return;
    this.text = text;
    var url = 'https://www.deepl.com/translator#auto/' + this.lanCode + '/' + encodeURIComponent(this.text);
    this.webView.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(url)));
  };

WebViewController.prototype.updateButton = function(){
    if(this.lanCode == 'en')
      this.lanButton.setTitleForState('English',0);
    else if(this.lanCode == 'zh')
      this.lanButton.setTitleForState('Chinese',0);
    else if(this.lanCode == 'ja')
      this.lanButton.setTitleForState('Japanese',0);
    else if(this.lanCode == 'de')
      this.lanButton.setTitleForState('German',0);
    else if(this.lanCode == 'fr')
      this.lanButton.setTitleForState('French',0);
    else if(this.lanCode == 'es')
      this.lanButton.setTitleForState('Spanish',0);
    else if(this.lanCode == 'ru')
      this.lanButton.setTitleForState('Russian',0);
    else if(this.lanCode == 'it')
      this.lanButton.setTitleForState('Italian',0);
  };
WebViewController.prototype.updateOffset = function(){
  if(!this.webView||!this.webView.window)return;
  var webControlerler = this;
  this.webView.evaluateJavaScript('document.getElementsByClassName("lmt__side_container--target")[0].getBoundingClientRect().top + document.body.scrollTop+document.documentElement.scrollTop;',function(ret){
    if(!webControlerler.webView)return;
    if(ret && !isNaN(parseFloat(ret))){
      webControlerler.webView.scrollView.contentOffset = {x:0,y:parseFloat(ret)+0};          
    }
    else{
      webControlerler.webView.scrollView.contentOffset = {x:0,y:130};          
    }
  });
  this.webView.evaluateJavaScript('document.getElementsByClassName("dl_header--sticky")[0].style.display = "none";\
    document.getElementsByClassName("lmt__stickyMenubar_whiteBackground--show")[0].style.display = "none";\
    document.getElementsByClassName("lmt__language_container")[0].style.display = "none";\
    document.getElementsByClassName("lmt__language_container")[1].style.display = "none";\
    ',function(ret){});
}
