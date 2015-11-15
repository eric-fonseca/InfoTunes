 "use strict";
 
 //Declare Globals
 var ECHONEST_JSONP_URL = "http://developer.echonest.com/api/v4/artist/biographies?api_key=";
 var ECHONEST_API_KEY = "EM0W4FIYKSCIW9LIZ";
 
 var LYRICS_JSONP_URL = "http://api.lyricsnmusic.com/songs?";
 var LYRICS_API_KEY = "&format=json&callback=jsonLoaded&api_key=52deb6e37804ebf5e19ae1e656514b";	
 
 var YOUTUBE_URL = "http://gdata.youtube.com/feeds/api/videos?q=";
 var YOUTUBE_SETTINGS = "&start-index=1&max-results=1&v=2&alt=json";
 
 var RETURN_KEY = 13;
 var showVideo = 1;
 var showLyrics = 1;
 var fullData;
 var url;
 var source = "wikipedia";
 window.onload = init;
 //if an error occurs display a message to tell the user
 window.onerror=function(){
	document.querySelector("#DynamicContent").innerHTML += "<b><h3>We're sorry! An error has occurred.</h3></b>";
 }
 //Initial load-up
 function init(){
	//Changes the source for artist information
	document.querySelector("#sourceSelect").onchange = function(e){
			if ( e.target.value == "last.fm"){
				source = "last.fm";
				document.getElementById('artistData').checked = false;
				document.getElementById('artistData').disabled = true;
			}
			else if ( e.target.value == "wikipedia"){
				source = "wikipedia";
				document.getElementById('artistData').disabled = false;
				
			}else if ( e.target.value == "none"){
				source = "none";
				document.getElementById('artistData').checked = false;
				document.getElementById('artistData').disabled = true;
			}
			
	};
	
	//Events to start loading the Data
	document.querySelector("#search").onclick = getData;
	document.querySelector("#artist").onkeyup = doKeyup;
	document.querySelector("#song").onkeyup = doKeyup;
	
	//Manages the check boxes
	document.getElementById('artistData').onchange = function(e){
			
			if( e.target.checked){
				fullData = true;
			}else{
				fullData = false;
			}
	};	
	
	document.getElementById('videoData').onchange = function(e){
			if(e.target.checked){
				showVideo = 1;
			}
			else{
				showVideo = 0;
			}
	};	
	
	document.getElementById('lyricsData').onchange = function(e){
			if(e.target.checked){
				showLyrics = 1;
			}
			else{
				showLyrics = 0;
			}
	};	
 }
 //if the user hits enter, then search for data
 function doKeyup(e){
		if(e.keyCode == RETURN_KEY){
			getData();
		}
	}
 
 //Function to load the data from the API's
 function getData(){
	url = ECHONEST_JSONP_URL;
	var url2 = LYRICS_JSONP_URL;
	var url3 = YOUTUBE_URL;
	url2 += LYRICS_API_KEY;
	url2 += "&track=";
		
	var artist = document.querySelector("#artist").value;
	artist = artist.trim();
	if(artist.length < 1) return;
	
	document.querySelector("#DynamicContent").innerHTML = "";
	//display artist loading bar
	document.querySelector("#DynamicContent").innerHTML += "<span id = 'infoLoader'></br><b> Searching for " + artist + "...</b></br><progress></progress></span>";
	
	artist = encodeURI(artist); 
	url +=  ECHONEST_API_KEY;
	url += "&name=";
	
	var song = document.querySelector("#song").value;
	song = song.trim();
	
	if(song.length < 1) return;
	song = encodeURI(song); 
 
	url += artist;
	
	url2 += song;
	url2 += "&artist="+artist;
	
	url3 += artist + "+" + song;
	url3 += YOUTUBE_SETTINGS;
	
	//calls the video first so it is at the top of the results
	if(showVideo){
		$.getJSON(url3).done(function(data){eventJsonLoaded(data);});
	}	
	else{
		//if the user doesn't want the video, it returns the artist info instead
		$.getJSON(url).done(function(data){eventJsonLoaded(data);});
	}
		var script = document.createElement('script');
		script.setAttribute('src',url2);
		script.setAttribute('id','lastFMFetch');
		document.querySelector('head').appendChild(script);
 }
 
 //function that loads the music video and artist info
 function eventJsonLoaded(obj){
 //error detection
	if(obj.error){ 
		var message = obj.message;
		document.querySelector("#dynamicContent").innerHTML += "<b>Error: " + message + "</b>";
		$("#dynamicContent").fadeIn(1000);
		return; // bail out
	}
	
	//if the data has a .response property (the artist information API) then run this section of the function
	if(obj.response){
		var allBios = obj.response.biographies;
	
		var bigString="";
		if (!(allBios instanceof Array)){
			allBios = [allBios]; // put the object in an array
		}
		for (var i=0;i<allBios.length;i++){
	
		if(source != "none"){
			if(allBios == undefined || artist.value=="Artist" || allBios[0] == undefined){
			
			}
			else if(song.value=="Title"){
			
			}
			else{
				if(allBios[i].site == source){
					var event = allBios[i];
					var completeBiography = event.text;
					if(source == "wikipedia"){
						if(fullData == true){
							var Biography = completeBiography.replace(/:/g,":</br>&nbsp;");
						}
						else{
							//cut down the wikipedia article so that it isn't so long
							var Biography = completeBiography.substring(0, completeBiography.indexOf("History:"));
							if (Biography.length == 0){
								completeBiography = event.text;
								Biography = completeBiography.substring(0, completeBiography.indexOf("Life and career:"));
							}
							if (Biography.length == 0){
								completeBiography = event.text;
								Biography = completeBiography.substring(0, completeBiography.indexOf("Early life"));
							}
							if (Biography.length == 0){
								completeBiography = event.text;
								Biography = completeBiography.substring(0, completeBiography.indexOf("Music career:"));
							}
						}
					}
			
					if (source == "last.fm"){
						var Biography = completeBiography;
					}
					var line = "";
					line += "<details open><summary>Artist Information</summary>";
					line += "<div class='eventDiv'>";
					line += Biography;
					line += "</br></br>";
					line += "</details></div>";
					bigString += line;
				}
			  }
			}
			else if (source == "none"){
				bigString = "";
			}
		}
	}
	else{
		//load the music video
		
		//Used "http://stackoverflow.com/questions/6560311/how-to-get-a-youtube-playlist-using-javascript-api-and-json" as a guideline
		var vids = new Array();
		var imgs = new Array();
		var title = new Array();
		$.each(obj.feed.entry, function(i, item) {
		vids.push( item["media$group"]["yt$videoid"]["$t"] );
		imgs.push(item["media$group"]["media$thumbnail"][3]["url"]);
		title.push(item["media$group"]["media$title"]["$t"]);
	});
		var bigString = "";
		var line = "<center><h3>"+title+"</h3>";
		
		line += "<div style='background-image:url("+imgs+");"; 
		line += "width:640px; ";
		line += "height:360px;"; 
		line += "background-position:center;'>";
		line +="<a href='http://www.youtube.com/watch?v=";
		line += vids;
		line +="' target = '_blank'>";
		line += "<button type='button' id='play'>&#9654</button></div>";
		line += "</a></center>"; 
		
		bigString += line;
		//call the artist data once the video is loaded
		$.getJSON(url).done(function(data){eventJsonLoaded(data);});
		
		}
	
	//get rid of the artist loading bar
	document.getElementById('infoLoader').style.display = 'none';
	document.querySelector("#DynamicContent").innerHTML += bigString;
	$("#DynamicContent").fadeIn(1000);
	if(obj.response){
		if(showLyrics){
			//display lyrics loading bar
			document.querySelector("#DynamicContent").innerHTML += "<span id = 'lyricsLoader'><b> Searching for lyrics...</b></br><progress></progress></span>";
		}
	}
 }
 //function to load the lyrics
 function jsonLoaded(obj){
	if(obj.error){ 
		var message = obj.message;
		document.querySelector("#dynamicContent").innerHTML += "<b>Error: " + message + "</b>";
		return; 
	}
	
	var lyrics = "";
	if(showLyrics){
		//error handling
		if(artist.value=="Artist" || song.value=="Title" || obj.data[0]==undefined){
			lyrics = "<b><h3>Couldn't retrieve lyrics</b></h3>";	
		}
		else{
			var string = obj.data[0].snippet;  
			lyrics = "<details open><summary>Lyrics for " + obj.data[0].artist.name + " - " + obj.data[0].title + "</summary>";
 
			for(var i = 0; i < string.length; i++){
				if(string[i] == String.fromCharCode(13)){
					lyrics += "</br>";
				}
				lyrics += string[i];
			}
			lyrics += "</br></br><a href = '" + obj.data[0].url + "' target='_blank'>Full lyrics</a></details>";
			
		}	
		//get rid of the lyrics loading bar
		if(document.getElementById('lyricsLoader') != null){
			document.getElementById('lyricsLoader').style.display = 'none';
		}
	}
	else{
		lyrics = "";
	}
	document.querySelector("#DynamicContent").innerHTML += lyrics;
	$("#DynamicContent").fadeIn(1000);
	
 }