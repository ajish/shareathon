/**
* Copyright Shareaholic, Inc. (www.shareaholic.com).  All Rights Reserved.
* 
* @Author Ankur Agarwal
* 
*/

if (typeof(SHR)=="undefined") SHR = {};

SHR.Counter = (function(){
    
    var testUrl = "google.com";
    
    function facebook(url,callback){
        var query = 'https://api.facebook.com/method/fql.query?query=SELECT+share_count+FROM+link_stat+WHERE+url=%22'+encodeURI(url)+'%22&format=json&?';
        $.getJSON(query,function(response){
            //console.log(response[0].share_count);
            var count =  typeof(response[0]) != "undefined" ? response[0].share_count : 0;
            var html = '<a href="'+query+'">'+count+'</a>';
            callback(html);
        });
    }
    
    function twitter(url,callback){
        var query = 'http://urls.api.twitter.com/1/urls/count.json?url='+encodeURI(url)+'&?';
        $.getJSON(query, function(response){
            var count = typeof(response)  != "undefined" ? response.count : 0;
            var html = '<a href="'+query+'">'+count+'</a>';
            callback(html);
        });
    }
    
    return{
        facebook : facebook,
        twitter : twitter
    }

})();

var Shareathon = (function(){
    
    var apihost = "www.shareaholic.com";
    var currentService = false;
    
    function actionHandler() {
        console.log("Sharing.....");
        var type = "executeAction" ;
        var callback;
        var parent = $(this).parent();
        console.log(parent);
        var data =  {"url" : parent.attr("url"),"title" : parent.attr("title"),"service": $(this).attr("serviceid")};
        console.log("sending request..");
        sendRequest(type ,data, callback);
    }
    
    function sendRequest(requestType,data, callback){
        chrome.extension.sendRequest({
                type: requestType,
                name: data
            },function(response) {
                console.log(response);
                if(typeof(callback) !== "undefined" ){
                    callback(response);
                }
            }
        );
    };
    
    
    function initServiceOptions(){

        var dataObj = getServiceData();
        
        var storiesObj = dataObj.stories;
        //Population in current stories
        storiesObj.each(function(){
            renderOptions(this)
        });
        
        //Register for Page changes
        registerforPageChange(dataObj.pages);
        
        //Regsiter for populate in future stories
        //registerDomChange(dataObj.register);

    }


    function registerDomChange(regsiterObj){
        $(regsiterObj.location).bind('DOMNodeInserted', function(event) {
            if(event.target.nodeName == regsiterObj.ch && event.relatedNode.nodeName == regsiterObj.par){
                renderOptions(event.target);
            }
        });
    }
 
    
    function getServiceData(storyObj){
        
        if(typeof(currentService) == "undefined"  || !currentService ){
            console.error("service not defined");
        }
        
        switch(currentService){
            case "facebook" :
                return {
                    stories : $("div.storyContent"),
                    pages : {location : "ul.uiList" , par :"UL", ch :  "LI"},
                    register : {location : "ul.uiList" , par :"UL", ch :  "LI"},
                    storyLink : $("strong > a" ,storyObj).attr("href"),
                    storyTitle : $("strong > a" ,storyObj).text(),
                    location : $('a.share_action_link',storyObj).parent().parent()
                };
            
            case "googleplus":
                return {
                    stories : $("div.Sq > div"),
                    pages : {location : "div.Sq" , par :"DIV", ch :  "DIV"},
                    register : {location : "div.Sq" , par :"DIV", ch :  "DIV"},
                    storyLink : $("a.ot-anchor" ,storyObj).attr("href"),
                    storyTitle :$("a.ot-anchor" ,storyObj).text(),
                    location :  $('div.Bx',storyObj)
                };
                
            default:
                console.error("service not defined");
        }
        
    }
    
    function registerforPageChange(regsiterObj){
        
        console.log("Fires when a node is being inserted into a document");
        $(regsiterObj.location).live('DOMNodeInserted', function(event) {
            console.log("Page change Detected");
            console.log(event.target);
            if(event.target.nodeName == regsiterObj.ch && event.relatedNode.nodeName == regsiterObj.par){
//                if($(event.target).hasClass("md"))
//                    alert("Mil gya");
                renderOptions(event.target);    
            }
        });
    }

    function renderOptions(storyObj){

            //Creating the shareathon object to be added to story
            var shareathonObj = $('<div><label><img src="'+ chrome.extension.getURL("images/shareaholic_button_230_bw.png") + '" height="9" width="12" alt="Shareaholic" style="opacity:0.4;filter:alpha(opacity=40);-moz-opacity:0.4;" /> Share on:</label></div>');
            var separator = " | ";
            
            var dataObj = getServiceData(storyObj);
            
            //Extracting link and title from the story
            var storyLink = dataObj.storyLink;
            var storyTitle = dataObj.storyTitle;

            //Finding the location in the story
            var locationObj = dataObj.location;

            if( typeof(storyLink) == "undefined"){
                //We dont want to proceed when the URL is not present
                return;
            }
            
            
            //Generating the Share html to be inserted
            var htmlHeader = '<span url="'+storyLink+'" title="'+storyTitle+'"></span>';
            
            var fbHtml = '<a serviceid="facebook" title="Share with Facebook" >Facebook </a>';
            var fbObj = $(fbHtml).click(actionHandler);
            
            var twHtml = '<a serviceid="twitter" title="Share with Twitter" >Twitter </a>';
            var twObj = $(twHtml).click(actionHandler);
            
            var moreHtml = '<a serviceid="more" title="Share with more Services">More </a>';
            var moreObj = $(moreHtml).click(actionHandler);
            
            var headObj = $(htmlHeader).append(fbObj).append(twObj).append(moreObj);

            //Appending the Share Html
            //shareObj.after(headObj).after(" | ");
            shareathonObj.append(headObj);

            //Generating the Count Html
            var countObj = $("<span></span>");
            SHR.Counter.facebook(storyLink,function(count){
                var html = '<a>Facebook: '+count+' <a>';
                countObj.append(html);
            });
            SHR.Counter.twitter(storyLink,function(count){
                var html = '<a>Twitter: '+count+' </a>' ;
                countObj.append(html);
            })

            //Inserting the Count Html
            //shareObj.parent().parent().append(countObj);
            shareathonObj.append(separator).append(countObj);


            //Appending the Shareathon Object to the story
            locationObj.append(shareathonObj);
    }

    function detectService(){
        var fb = new RegExp("facebook");
        var gp = new RegExp("google.com");
        
        var src = location.hostname;
        console.log(location.hostname)
        var service = false;
        
        service = (src.search(fb) > 0) ? "facebook" : (
        service = (src.search(gp) > 0) ? "googleplus" : false);
        
        console.log(service +" detected");
        currentService = service;
    }
    
    function init(){
        console.log("Initializing Shareathon.....");
        
        //Detecting the current service
        detectService();
        
        //check whether enabled by user or not
        sendRequest("getSetting",{key:currentService}, function(status){
            console.log("Got the setting: " + status);
            if(status && status != "false") {
                initServiceOptions();
            }
        });
    }
    
    return{
        init : init
    }
      
  })();

Shareathon.init();