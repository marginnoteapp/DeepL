JSB.newAddon = function(mainPath){
  JSB.require('WebViewController');
  var newAddonClass = JSB.defineClass('DeepLAddon : JSExtension', /*Instance members*/{
    //Window initialize
    sceneWillConnect: function() {
        self.webController = WebViewController.new();
    },
    //Window disconnect
    sceneDidDisconnect: function() {
    },
    //Window resign active
    sceneWillResignActive: function() {
    },
    //Window become active
    sceneDidBecomeActive: function() {
    },
    notebookWillOpen: function(notebookid) {
      NSNotificationCenter.defaultCenter().addObserverSelectorName(self,'onPopupMenuOnNote:','PopupMenuOnNote');
      NSNotificationCenter.defaultCenter().addObserverSelectorName(self,'onPopupMenuOnSelection:','PopupMenuOnSelection');
      NSTimer.scheduledTimerWithTimeInterval(0.2,false,function(){
        var deepl_on = NSUserDefaults.standardUserDefaults().objectForKey('marginnote_deel_on');
        if(Application.sharedInstance().studyController(self.window).studyMode < 3 && deepl_on == true){// Not support in card deck mode
          Application.sharedInstance().studyController(self.window).view.addSubview(self.webController.view);
          self.layoutWebController();
          Application.sharedInstance().studyController(self.window).refreshAddonCommands();
          NSTimer.scheduledTimerWithTimeInterval(0.2,false,function(){ 
            Application.sharedInstance().studyController(self.window).becomeFirstResponder(); //For dismiss keyboard on iOS
          });
        }
      });
    },
    notebookWillClose: function(notebookid) {
      self.webController.view.removeFromSuperview();  
      NSNotificationCenter.defaultCenter().removeObserverName(self,'PopupMenuOnNote');
      NSNotificationCenter.defaultCenter().removeObserverName(self,'PopupMenuOnSelection');
    },
    documentDidOpen: function(docmd5) {
    },
    documentWillClose: function(docmd5) {
    },
    controllerWillLayoutSubviews: function(controller) {
      if(controller == Application.sharedInstance().studyController(self.window)){
          self.layoutWebController();
      }
    },
    queryAddonCommandStatus: function() {
      if(Application.sharedInstance().studyController(self.window).studyMode < 3)
        return {image:'deepl.png',object:self,selector:'toggleTranslate:',checked:(self.webController.view.window?true:false)};
      return null;
    },
    //Clicking note
    onPopupMenuOnNote: function(sender){
      if(!Application.sharedInstance().checkNotifySenderInWindow(sender,self.window))return;//Don't process message from other window
      if(!self.webController.view.window)return;
      var text = sender.userInfo.note.allNoteText();
      if(text && text.length){
        self.webController.translateText(text);
      }
    },
    //Selecting text on pdf or epub
    onPopupMenuOnSelection: function(sender){
      if(!Application.sharedInstance().checkNotifySenderInWindow(sender,self.window))return;//Don't process message from other window
      if(!self.webController.view.window)return;
      var text = sender.userInfo.documentController.selectionText;
      if(text && text.length){
        self.webController.translateText(text);
      }
    },
    toggleTranslate: function(sender) {
      if(self.webController.view.window){
        self.webController.view.removeFromSuperview();
        NSUserDefaults.standardUserDefaults().setObjectForKey(false,'marginnote_deel_on');
      }
      else{
        Application.sharedInstance().studyController(self.window).view.addSubview(self.webController.view);        
        self.layoutWebController();
        NSUserDefaults.standardUserDefaults().setObjectForKey(true,'marginnote_deel_on');
        NSTimer.scheduledTimerWithTimeInterval(0.2,false,function(){ 
          Application.sharedInstance().studyController(self.window).becomeFirstResponder(); //For dismiss keyboard on iOS
        });
      }
      Application.sharedInstance().studyController(self.window).refreshAddonCommands();
    },
  }, /*Class members*/{
    addonDidConnect: function() {
    },
    addonWillDisconnect: function() {
    },
    applicationWillEnterForeground: function() {
    },
    applicationDidEnterBackground: function() {
    },
    applicationDidReceiveLocalNotification: function(notify) {
    },
  });
  newAddonClass.prototype.layoutWebController = function(){
    var frame = Application.sharedInstance().studyController(this.window).view.bounds;
    var width = frame.width > 300?(300 + (frame.width - 300)/2):300;
    this.webController.view.frame = {x:(frame.width-width)/2,y:frame.height - 300,width:width,height:280};
  };
  return newAddonClass;
};

