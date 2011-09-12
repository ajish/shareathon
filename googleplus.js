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
//                if(callback){
//                    callback(response);
//                }
            }
        );
    };
    
    
    function initOptions(){

        var storiesObj = $("div.Sq > div");
        //console.log(storiesObj);
        var iconURL = chrome.extension.getURL("images/shareaholic_16x16.png");
        //for(var storyObj in storiesObj){
        storiesObj.each(function(){
            console.log(this);
            renderOptions(this);
        });

    }

    function registerDomChange(){
        
        $("div.Sq").bind('DOMNodeInserted', function(event) {
            //console.log(event.target.nodeName + event.relatedNode.nodeName);
            if(event.target.nodeName == "DIV" && event.relatedNode.nodeName == "DIV"){
//                console.log(event.target.nodeName + event.relatedNode.nodeName);
//                console.log(event.target);
                renderOptions(event.target);
            }
        });
    }
    
    function googleplusObj(storyObj){
        
        return {
            storyLink : $("a.ot-anchor" ,storyObj).attr("href"),
            storyTitle :$("a.ot-anchor" ,storyObj).text(),
            location :  $('div.Bx',storyObj)
        };
    }
    
    function renderOptions(storyObj){

            //Creating the shareathon object to be added to story
            var shareathonObj = $("<div>Share with: </div>");
            var separator = " | ";
            
            var dataObj = googleplusObj(storyObj);
            
            //Extracting link and title from the story
            var storyLink = dataObj.storyLink;
            var storyTitle = dataObj.storyTitle;

            //Finding the location in the story
            var locationObj = dataObj.location;

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
//    function renderOptions(storyObj){   
//
//            //Creating the shareathon object to be added to story
//            var shareathonObj = $("<div>Share with:</div>");
//            var separator = " | ";
//
//            //Extracting link and title from the story
//            var storyLink = $("a.ot-anchor" ,storyObj).attr("href");
//            var storyTitle = $("a.ot-anchor" ,storyObj).text();
//            
//            if( typeof(storyLink) == "undefined"){
//                //We dont want to proceed when the URL is not present
//                return;
//            }
//            
//            //Finding the location in the story
//            var locationObj = $('div.Bx',storyObj);
//            //console.log(locationObj);
//
//            //Generating the Share html to be inserted
//            var htmlHeader = '<span url="'+storyLink+'" title="'+storyTitle+'"></span>';
//            var htmlBody = '<a serviceid="more" class="shareathonShare"  title="Share with other social networks" storyTitle="'+storyTitle+'" >Shareathon</a>';
//            var bodyObj = $(htmlBody).click(moreClickHandler);
//            var headObj = $(htmlHeader).append(bodyObj);
//
//
//
//            //Appending the Share Html
//            //shareObj.after(headObj).after(" | ");
//            shareathonObj.append(headObj);
//
//            //Generating the Count Html
//            var countObj = $("<span></span>");
//            SHR.Counter.facebook(storyLink,function(count){
//                var html = '<a>Facebook: '+count+' <a>';
//                countObj.append(html);
//            });
//            SHR.Counter.twitter(storyLink,function(count){
//                var html = '<a>Twitter: '+count+' </a>' ;
//                countObj.append(html);
//            })
//
//            //Inserting the Count Html
//            //shareObj.parent().parent().append(countObj);
//            shareathonObj.append(separator).append(countObj);
//
//
//
//            //Appending the Shareathon Object to the story
//            locationObj.append(shareathonObj);
//    }

    function init(){
        console.log("Initializing Shareathon.....");
        initOptions(); 
        registerDomChange();
    }
    
    return{
        init : init
    }
      
  })();

Shareathon.init();