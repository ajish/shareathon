/**
* Copyright Shareaholic, Inc. (www.shareaholic.com).  All Rights Reserved.
* 
* @Author Ankur Agarwal
* 
*/

if (typeof(SHR)=="undefined") SHR = {};

SHR.host = "www.shareaholic.com";

var debug = false;
if(debug){
    var genericLog = function(str){
        if (typeof(console) != 'undefined' && console) {
          console.log(str);
        } else {
          alert(str);
        }
    };
}else{
    var genericLog = function(str){};
}

var shrLog = genericLog || {};
var shrErr = genericLog || {};

/*
 *Action Lib
 *Contains all actions
 */
SHR.Action = (function($) {

    var apiKey = 'fc83e97bd01abdf30672a513d7f9812df';
    var host = "www.shareaholic.com";
    var SHR_track = {"utm_source"   :   "chrome_hackernews",
                     "utm_medium"   :   "browser_ext",
                     "utm_campaign" :   "product"
                    };

    var googleAnalytics = 'SHR_track = '+ JSON.stringify(SHR_track)+ ' ;';
    
    function actionServicelet(Obj){
        shrLog(Obj);
        var serviceletJSURL =  'http://'+ host + '/media/js/servicelet.' + (host=='www.spreadaholic.com' ? '' : 'min.') +'js';
        var code = "javascript: "+ googleAnalytics +" SHR_config = {}; SHR_config.link='"+Obj.url+"';SHR_config.title='"+Obj.title+"';SHR_config.apikey = '"+apiKey+"';SHR_config.twitter_template=''; SHR_config.short_link = ''; SHR_config.shortener =''; SHR_config.shortener_key =''; __shr_log="+Obj.log+"; __shr_service='"+Obj.service+"'; __shr_center=true;(function(){var d=document,w=window;if(w.SHR&&w.SHR.Servicelet){SHR.Servicelet.show()}else{var s=d.createElement('script');s.setAttribute('language','javascript');s.id='shr-servicelet';s.setAttribute('src','"+serviceletJSURL+ "');d.body.appendChild(s);}})();void(0);"
        chrome.tabs.getSelected(null,function(tab){
            chrome.tabs.update(tab.id,{url:code});
        });
    }
    function startListening() {
        console.log('start listening');
        chrome.extension.onRequest.addListener(function(req,sender,sendResponse) {
            if (req.type == 'executeAction') {
                sendResponse( SHR.Action.execute(req.name));
            }
        });
    }
    return{
        execute: function(Obj){
            console.log("get the resquest, executing...");
            shrLog(Obj);
            switch(Obj.service){
                case 'more':
                    Obj.log = false;
                    actionServicelet(Obj);
                    break;
                case 'twitter':
                    Obj.log = true;
                    actionServicelet(Obj);
                    break;
                case 'facebook':
                    Obj.log = true;
                    actionServicelet(Obj);
                    break;
                default:
                    shrLog('Unknow action');
                    break;
            }
        },
        startListening : startListening
    }

})(jQuery);

shrLog("loaded Action Library");