JS2.OO.createClass("Controller.Rating");(function(K,Package){var self=K;var _super=JS2.OO['super'];K.oo('method',"initialize",function(jq,payloadUrl){this.view=new View.Rating(jq,this);this.jq=jq;this.url=payloadUrl+'/rating';var self=this;this.userRating=new Sci.StarRating(this.view.userRating,{callback:function(){self.submit(arguments[0])}});this.dsRating=new Sci.StarRating(this.view.factRating,{disabled:true});this.ratingHash={};this.registerEvents();});K.oo('method',"registerEvents",function(){var self=this;this.jq.hover(function(){self.showDialog();},function(){self.hideDialog();});});K.oo('method',"showDialog",function(){this.view.factRating.addClass('active');this.view.jqDialog.show();});K.oo('method',"hideDialog",function(){this.view.factRating.removeClass('active');this.view.jqDialog.hide();});K.oo('method',"submit",function(val){var self=this;sci.ajax.post(self.url,{rating:val},function(r){self.setRating(r);});});K.oo('method',"setRating",function(r){this.ratingHash=r;this.userRating.showRating(r.ur);this.view.displayTableRating(r);this.view.setUserRatingText();});K.oo('method',"getRatingHash",function(){return this.ratingHash;});})(Controller.Rating,Controller);JS2.OO.createClass("View.Rating");(function(K,Package){var self=K;var _super=JS2.OO['super'];K.oo('method',"initialize",function(jq,controller){this.jq=jq;var TMP_SEL_MARKER=this.SEL_MARKER||JS2.SEL_MARKER;TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this),"Rating Container",this.jq,null);this.controller=controller;this.initHTML();});K.oo('method',"initHTML",function(){this.factRating=this.jq.first('.factRating');var TMP_SEL_MARKER=this.SEL_MARKER||JS2.SEL_MARKER;TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this),"Table Rating",this.factRating,null);this.userRating=this.jq.first('.userRating');var TMP_SEL_MARKER=this.SEL_MARKER||JS2.SEL_MARKER;TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this),"User Rating",this.userRating,null);this.jqDialog=this.jq.first('.ratingDialog');var TMP_SEL_MARKER=this.SEL_MARKER||JS2.SEL_MARKER;TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this),"Rating Dialog",this.jqDialog,null);this.jqAvgRating=this.jq.first('.avgRating');var TMP_SEL_MARKER=this.SEL_MARKER||JS2.SEL_MARKER;TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this),"Average Rating",this.jqAvgRating,null);this.jqTotalRatings=this.jq.first('.totalRatings');var TMP_SEL_MARKER=this.SEL_MARKER||JS2.SEL_MARKER;TMP_SEL_MARKER.addVal(TMP_SEL_MARKER.getRealClassScope(this),"Average Rating",this.jqTotalRatings,null);this.jqStatus=this.jq.first('.status');});K.oo('method',"displayTableRating",function(r){if(r.rc==0){this.controller.dsRating.highlight();}else{this.controller.dsRating.showRating(r.ar);}});K.oo('method',"setUserRatingText",function(){var r=this.controller.getRatingHash();var avgDesc='-';if(r.rc>0){var avgNumber=parseInt(this.controller.dsRating.idx||0)+1;avgDesc=avgNumber.toString()+' out of 5';}
else{avgDesc='this table has not been rated'}
this.jqAvgRating.html(avgDesc);this.jqTotalRatings.html(r.rc);if(r.rc==0){this.jqStatus.html("Rate this table: ");}else{this.jqStatus.html("Your Rating: ");}});})(View.Rating,View);