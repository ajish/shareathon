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
 *Storage Lib
 *Interacting with local storage
 */

SHR.Storage = (function($) {
    var defaults = {
        facebook: true,
        googleplus: true,
        twitter : true
    };
    
    function startListening() {
        console.log('start listening');
        chrome.extension.onRequest.addListener(function(req,sender,sendResponse) {
 		      
	     if (req.type == 'updateSetting') {
		sendResponse(updateSetting(req.name));
            }
	    else if(req.type == 'getSetting'){
            console.log("get the setting for")
            console.log(req);
            sendResponse(getKeyValue(req.name.key));					
		}
        });
    }

    function updateSetting(obj){
        upsertKey(obj.key,obj.value);
	}
    
    
    function deleteKey(key){
        delete localStorage[key];
    }
    
    function upsertKey(key,value){
        localStorage[key] = value;
    }
    
    function setUndefinedSettings(){
        for(var key in defaults){
            typeof(localStorage[key]) == "undefined" ? localStorage[key] = defaults[key] : console.log('Value already exist for '+key) ;
        }
    }
    function getKeyValue(key){
        return localStorage[key];
    }
    
    
    function init(){
        setUndefinedSettings();
        
    }
                
    return{    
        init : init,
        startListening : startListening
    }

})(jQuery);


SHR.Storage.init();