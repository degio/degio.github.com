JS2.OO.createClass("Controller.Main");  (function (K,Package) {var self=K; var _super=JS2.OO['super']; 
  K.oo('member', 'minHeight',  300);
  K.oo('member', 'gridMarginBottom',  26);
  K.oo('member', 'tabs',  {grid:0, develop:1, releaseNotes:2, webApps:3, logs:4, metadata:5, schema:6});

  K.oo('method', "initialize", function (options) {
    this.view = new View.Main();
    this.options = new Options.Main(options);
    this.windowResized = false;

    //@ Scope(Table)
    var jqTabs = $('.gridTabsContainer>.fact-tabList>li');
    var jqTableTab = jqTabs.eq(this.tabs.grid);
    var TMP_SEL_MARKER = this.SEL_MARKER || JS2.SEL_MARKER; TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this), "Table Tab", jqTableTab, null);
    var jqVisualizeTab = jqTabs.eq(this.tabs.webApps);
    var TMP_SEL_MARKER = this.SEL_MARKER || JS2.SEL_MARKER; TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this), "Visualize Tab", jqVisualizeTab, null);
    this.jqStatisticsTab = jqTabs.eq(this.tabs.logs);
    var TMP_SEL_MARKER = this.SEL_MARKER || JS2.SEL_MARKER; TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this), "Statistics Tab", this.jqStatisticsTab, null);

    this.jqSchemaTab = jqTabs.eq(this.tabs.schema); 

    this.tabHandler = WIDGET.tabs($(".gridTabsContainer"))
    this.getPageDimensions();

    // grid stuff
    this.payload    = new Grid0.Payload(this.options);
    var TMP_SEL_MARKER = this.SEL_MARKER || JS2.SEL_MARKER; TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this), "Payload", this.payload, null);
    var gridOptions = $.extend(true, this.options, {
      payload:  this.payload,
      width:    this.pageWidth,
      height:   this.pageHeight - this.gridMarginBottom,
      seed:     $('#grid')
    });

    this.grid = APP(Grid0, gridOptions);
    this.grid.start();

    this.grid.registerObserver(this);
    this.qlispText = $('.qlispText');
    $('.qlisp:first').click(function () { $('.qlispText').toggle() });

    this.datasetRating();

    // sharing
    this.share   = new Share.Main(this.grid, this.options);
    this.grid.registerObserver(this.share);

    this.initDeveloperTab();
    this.initReleaseTab();
    this.initSchemaTab();

    this.registerEvents();
  });

  K.oo('method', "initDeveloperTab", function () {
    var jqSeed     = $('#developer');
    this.develop   = new Page.Develop(jqSeed, this.options);
  });

  K.oo('method', "initSchemaTab", function () {
    var jqSeed     = $('#schema');
    this.developer = new Page.Developer(jqSeed, this.options);
    this.grid.registerObserver(this.developer);
  });

  K.oo('method', "initReleaseTab", function () {
    this.release = new Page.Release($('#releaseNotes'), this.options);
  });

  K.oo('method', "e_dataLoaded", function (first) {
    this.qlispText.html(sci.common.htmlDisplay(this.grid.data.payload().qlisp));
    if (first && this.tabHandler.selectedId != this.tabs.grid) {
      this.notify('hideFirstRunTip');
    }
    if (this.grid.actions.isFulltextSearchEnabled()) {
      $('#page-header>.titleWrapper .name-cell').addClass('fulltextSearchEnabled');
    } else {
      $('#page-header>.titleWrapper .name-cell').removeClass('fulltextSearchEnabled');
    }
  });

  K.oo('method', "e_resetPageDim", function () {
    this.resizeGrid();
    this.resizeGrid();
  });

  K.oo('method', "resizeGrid", function () {
    this.grid.resize({ width: this.pageWidth, height: this.pageHeight - this.gridMarginBottom });
  });

  K.oo('method', "setDefaultPane", function (paneName) {
    var paneNames = {
      view       : this.tabs.grid,
      visualize  : this.tabs.webApps,
      stats      : this.tabs.logs 
    };

    this.tabHandler.switchToPane(paneNames[paneName]);
  });

  K.oo('method', "e_switchPane", function (params) {
    if (params.pane == 'newThread') {
      this.tabHandler.switchToPane(this.tabs.develop);
    } else if (params.pane == 'metadata') {
      this.tabHandler.switchToPane(this.tabs.metadata);
    } else if (params.pane == 'grid') {
      this.tabHandler.switchToPane(this.tabs.grid);
    }
  });

  K.oo('method', "getPageDimensions", function () {
    this.pageWidth = this.view.getPageWidth();
    this.pageHeight = this.view.getPageHeight();
    if (this.pageHeight < this.minHeight) this.pageHeight = this.minHeight; 
  });

  K.oo('method', "registerEvents", function () {
    var self = this;

    $('#profile').click(function () {
      self.grid.profiler.report();
    });

    // resize grid 
    this.tabHandler.tabs.get(this.tabs.grid).click(function () {
      if (self.windowResized == true) {
        self.resizeGrid();
        self.windowResized = false;
      }
      window.location.hash = ''
    });

    this.tabHandler.tabs.get(this.tabs.develop).click(function () {
      self.resizeDeveloper();
    });

    $(window).resize(function () {
      self.getPageDimensions();
      self.resizeVisFrame();
      // fix a bug in jquery ui dialog under ie 8
      if ($.browser.msie && $.browser.version >= 8 && $('.ui-widget-overlay').length > 0) return;
      self.resizeMainPage();
      self.resizeDeveloper();
    });

    this.tabHandler.registerSwitchCallback(function(id) {
      if (id == self.tabs.grid && $.browser.safari) {
        self.grid.reloadScroll();
      } else if (id == self.tabs.grid) {
        self.resizeGrid();
      }
      if (id != self.tabs.grid) {
        self.grid.notify('hideFirstRunTip');
      }
      if (id == self.tabs.webApps) {
        if (!self.visFrame) {
          self.createVisualizationFrame();
        } else {
          if (self.visFrame.contentWindow.setVisHash) self.visFrame.contentWindow.setVisHash();
        }
      }
      // statistics
      if (id == self.tabs.logs) {
        if (!self.statsFrame) {
          self.statsFrame = $('<iframe src="/tables/stats/'+self.options.dataset.key+'/index" width="100%" height="450" scrolling="no" frameborder="0">/').appendTo($('#statistics'));
        } else {
          if (self.needRefreshStatsPage) {
            self.statsFrame[0].contentWindow.location.reload();
            self.needRefreshStatsPage = false;
          } else {
            self.statsFrame[0].contentWindow.statistics.statistics.notify('reload')
          }
        }
      }
      if (id == self.tabs.schema) {
        self.resizeDeveloper();
      }
    });
  });

  K.oo('method', "e_userLoggedIn", function () {
    if (this.statsFrame) { 
      if (this.statsFrame.is(':visible')) {
        this.statsFrame[0].contentWindow.location.reload();
      } else {
        this.needRefreshStatsPage = true;
      }
    }

    if (this.auth.isAdmin()) {
      this.jqStatisticsTab.show();
      this.jqSchemaTab.show();
    } else {
      this.jqStatisticsTab.hide();
      this.jqSchemaTab.hide();
    }
    
    this.develop.toggleEdit();
    this.release.toggleEdit();

  });

  K.oo('method', "resizeMainPage", function () {
    if (this.tabHandler.selectedId == this.tabs.grid) {
      this.resizeGrid();
      this.windowResized = false;
    } else {
      this.windowResized = true;
    }
  });

  K.oo('method', "resizeDeveloper", function () {
    if (this.tabHandler.selectedId == this.tabs.schema) {
      this.developer.autoHeight(this.pageHeight);
    }
  });

  K.oo('method', "datasetRating", function () {
    var ratingContainer = $('.rating:first');
    this.rating = new GridRating(ratingContainer, '/tables/main/' + this.options.dataset.key, this.grid);
  });

  K.oo('method', "loadRating", function (r) {
    this.rating.setRating(r);
  });

  K.oo('method', "createVisualizationFrame", function (src) {
    src = src || ('/tables/' + this.options.dataset.key + '/visualizations');
    var options = {
      seed:  $('#visualizations'),
      src:   src,
      width: '100%'
    };
    var iframe    = new Controller.IFrame(this);
    this.visFrame = iframe.start(options);
    this.resizeVisFrame();
  });

  K.oo('method', "loaded", function (visualization_page) {
    this.resizeVisFrame();
  });

  K.oo('method', "resizeVisFrame", function () {
    if (this.visFrame) this.visFrame.style.height = this.pageHeight + 'px';
  });

  K.oo('method', "globalMessage", function (msg) {
    sci.website.message(msg);
  });

  K.oo('method', "showVisualization", function () {
    var hash = window.location.hash;
    if (/^\#vis_\d+$/.test(hash)) {
      var id  = hash.replace(/\#vis_/, '');
      var url = '/tables/' + this.options.dataset.key + '/visualizations/show/' + id;
      this.createVisualizationFrame(url);
      this.tabHandler.switchToPane(this.tabs.webApps);
    }
  });
})(Controller.Main, Controller);

JS2.OO.createClass("Options.Main");  (function (K,Package) {var self=K; var _super=JS2.OO['super']; 
  K.oo('method', "getUsername", function () {
    return sci.auth.username();
  });

  K.oo('method', "getUserEmail", function () {
    return sci.auth.userEmail();
  });

  K.oo('method', "getBaseUrl", function () {
    if (!this.page.baseUrl) this.page.baseUrl = location.protocol + '//' + location.host;
    return this.page.baseUrl;
  });

  K.oo('method', "loggedIn", function () {
    return sci.auth.loggedIn();
  });

  K.oo('method', "userId", function () {
    return sci.auth.userId();
  });

  K.oo('method', "ownerId", function () {
    return this.dataset.ownerId;
  });

  K.oo('method', "ownerName", function () {
    return this.dataset.ownerName;
  });

  K.oo('method', "isOwner", function () {
    return (this.ownerId() == this.userId());
  });

  K.oo('method', "isDev", function () {
    return sci.auth.isDev();
  });

  K.oo('method', "isAdmin", function () {
    return sci.auth.isAdmin();
  });

  K.oo('method', "deletable", function () {
    return this.dataset.isDeletable;
  });

  K.oo('method', "editable", function () {
    if (this.dataset.isStatic || this.dataset.isPrivate) return (this.isAdmin() || this.isOwner());
    return true;
  });

  K.oo('method', "datasetCountdown", function () {
    if (!this.dataset.isNew) return false;
    return this.dataset.countdown;
  });

  K.oo('method', "getDatasetName", function () {
    return this.dataset.name;
  });

  K.oo('method', "getDatasetTags", function () {
    if (!this.dataset.tags) this.dataset.tags = $('.titleMeta>.dsTags:first').attr('title');
    return this.dataset.tags;
  });

  K.oo('method', "getDatasetType", function () {
    return this.dataset.type;
  });

  K.oo('method', "getDatasetDesc", function () {
    return this.dataset.description;
  });

  K.oo('method', "initialize", function (hash) {
    this.www2Domain = hash.www2Domain;

    // dataset info
    this.dataset = {};
    this.dataset.id           = hash.datasetId;
    this.dataset.key          = hash.datasetKey;
    this.dataset.name         = hash.datasetName;
    this.dataset.description  = hash.datasetDescription;
    this.dataset.seoUrl       = hash.seoUrl;
    this.dataset.type         = hash.dsType;
    this.dataset.ownerId      = hash.ownerId;
    this.dataset.ownerName    = hash.ownerName;
    this.dataset.revisions    = hash.revisions;
    this.dataset.subscribe    = hash.subscribe;
    this.dataset.unlisted     = hash.unlisted;
    this.dataset.isNew        = hash.isNew;
    this.dataset.isDeletable  = hash.isDeletable;
    this.dataset.isStatic     = hash.isStatic;
    this.dataset.isPrivate    = hash.isPrivate;
    this.dataset.countdown    = hash.countdown;
    this.dataset.cacheTtl     = hash.cacheTtl;
    this.dataset.isPoiTable   = hash.isPoiTable;
    this.dataset.defaultReference = hash.defaultReference;
    this.dataset.correctionExists = hash.correctionExists;
    this.dataset.isApiAccessible = hash.isApiAccessible;
    this.dataset.isDownloadable  = hash.isDownloadable;
    
    // grid info
    this.grid              = {};
    this.grid.gridStateId  = hash.gridStateId;
    this.grid.apiMode      = hash.apiMode;
    this.grid.unsubscribe  = hash.unsubscribe;

    // page info
    this.page  = {};

    // user info
    this.user = {};
    this.user.preferences = JSON.parse(hash.userPref);

    // preload
    this.getDatasetName();
    this.getDatasetDesc();
    this.getDatasetTags();
  });
})(Options.Main, Options);

JS2.OO.createClass("View.Main");  (function (K,Package) {var self=K; var _super=JS2.OO['super']; 
  K.oo('member', 'tabHeight',  25);
  K.oo('member', 'headerHeight',  54);
  K.oo('member', 'footerHeight',  56);

  K.oo('method', "initialize", function () {
    this.jqTitleInfo = $('.dsInfo');
  });

  K.oo('method', "getPageWidth", function () {
    var ele   = $('#page-width');
    var paddingLeft  = parseInt(ele.css("paddingLeft").match(/\d*/));
    var paddingRight = parseInt(ele.css("paddingLeft").match(/\d*/));
    var width = ele.innerWidth() - (paddingLeft + paddingRight); 
    return width;
  });

  K.oo('method', "getPageHeight", function () {
    return $(window).height() - this.headerHeight - this.tabHeight - this.footerHeight;
  });

})(View.Main, View);

JS2.OO.createClass("GridRating"); GridRating.oo('extends', Controller.Rating); (function (K,Package) {var self=K; var _super=JS2.OO['super']; 
  K.oo('method', "initialize", function (jq, payloadUrl, grid) {
    this.grid = grid;
    _super(this, jq, payloadUrl);
  });

  K.oo('method', "submit", function (val) {
    this.userRating.idx = -1;
    if (this.grid.auth.requireLogin(this, val)) return;
    _super(this, val);
  });
})(GridRating, null);

JS2.OO.createClass("Controller.IFrame");  (function (K,Package) {var self=K; var _super=JS2.OO['super']; 
  K.oo('method', "initialize", function (caller) {
    this.readyFunctions = [];
    this.caller = caller;
  });

  K.oo('method', "start", function (options) {
    var seed = options.seed || document.body;
    var iframe = document.createElement("iframe");
    iframe.src = options.src;
    if (options.width) iframe.width = options.width;
    if (options.height) iframe.height = options.height;
    iframe.frameBorder = '0';
    iframe.frameController = this;

    seed[0].appendChild(iframe);
    iframe.doc = null;
    if(iframe.contentDocument)
      iframe.doc = iframe.contentDocument;
    else if(iframe.contentWindow)
      iframe.doc = iframe.contentWindow.document;
    else if(iframe.document)
      iframe.doc = iframe.document;
    if(iframe.doc == null)
      throw "Document not found, append the parent element to the DOM before creating the IFrame";
    // iframe.scrolling = 'no';
    this.iframe = iframe;

    return iframe;
  });

  K.oo('method', "ready", function (iwindow) {
    this.iwindow = iwindow;
    this.iwindow.visualization_page.setParent(this.caller);
    this.caller.loaded(iwindow.visualization_page);
  });

})(Controller.IFrame, Controller);