QuickTime = {

	version: 0.9,
	
	upgrade: undefined,
	
	installed: false,
	
	getElementsByClassName: function(className, tag, elm)
	{
		//http://www.robertnyman.com/2005/11/07/the-ultimate-getelementsbyclassname/
		
		var testClass = new RegExp("(^|\\s)" + className + "(\\s|$)");
		var tag = tag || "*";
		var elm = elm || document;
		var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
		var returnElements = [];
		var current;
		var length = elements.length;
		for(var i=0; i<length; i++)
		{
			current = elements[i];
			
			if(testClass.test(current.className))
			{
				returnElements.push(current);
			}
		}
		return returnElements;
	},

	init: function()
	{		
		QuickTime.installed = QuickTime.isQTInstalled();
						
		if (!QuickTime.installed && !QuickTime.upgrade) 
		{
			var divs = QuickTime.getElementsByClassName("quicktime","div");
				
			for (var i = 0 ; i < divs.length ; ++i)
			{
				var alt = QuickTime.getElementsByClassName("alt-content", "div", divs[i]);
				
				
				if (alt.length == 1)
				{
					divs[i].innerHTML = alt[0].innerHTML;
				}
			}
			
			return;
		}
		
		var regexp = new RegExp("\\.mov(\\?|$)");
		
		var divs = QuickTime.getElementsByClassName("quicktime","div");
		
		for (var i = 0 ; i < divs.length ; ++i)
		{			
			var links = divs[i].getElementsByTagName("a");
			
			for (var j = 0 ; j < links.length ; ++j)
			{
				if (regexp.test(links[j].href)) QuickTime.modifyLink(links[j]);
			}
			
			if (QuickTime.installed)
			{
				//add space for the control
				divs[i].style.height = divs[i].clientHeight + 16 + "px";
			}
		}
				
		var links = QuickTime.getElementsByClassName("playin-[^\\s]+", "a");
		
		for (var i = 0 ; i < links.length ; ++i)
		{								
			if (regexp.test(links[i].href))
			{
				var div = QuickTime.getPlayerDIV(links[i]);
				
				if (div != null) QuickTime.modifyLink(links[i]);
			}
		}
	},
	
	getPlayerDIV: function(link)
	{		
		if (link.className.indexOf("playin-") == -1) return null;
					
		var cssnames = link.className.split(/\s+/);

		for (var j = 0 ; j < cssnames.length ; ++j)
		{			
			if (cssnames[j].indexOf("playin-") == 0)
			{
				return document.getElementById(cssnames[j].substring(7));
			}
		}
		
		return null;
	},
	
	modifyLink: function(link)
	{
		if (QuickTime.installed)
		{
			link.onclick = function(){ return QuickTime.playMovie(this); }
		}
		else
		{
			if (typeof QuickTime.upgrade == 'string')
			{
				link.href = QuickTime.upgrade;
			}
			else if (typeof QuickTime.upgrade == 'function')
			{
				QuickTime.upgrade(link);
			}
		}
	},

	playMovie: function(link)
	{
		var div = QuickTime.getPlayerDIV(link);
		
		if (div == null) div = link.parentNode;
			
		var width = div.clientWidth;
		var height = div.clientHeight;

		//TODO: do this properly with element creation code
		var embed = "<embed width='"+width+"' height='"+height+"' src='"+link+"' type='video/quicktime' pluginspage='http://www.apple.com/quicktime/download/' controller='true' autoplay='true' scale='aspect'></embed>";
		var obj = "<object width='"+width+"' height='"+height+"' classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B' codebase='http://www.apple.com/qtactivex/qtplugin.cab'><param name='src' value='"+link+"' /><param name='controller' value='true' /><param name='autoplay' value='true' /><param name='scale' value='aspect' />"+embed+"</object>";

		div.innerHTML = obj;

		QuickTime.fixIE(div);
		
		QuickTime.ensureVisible(div);
		
		return false;
	},
		
	fixIE: function(element)
	{
		if(navigator.appName != "Microsoft Internet Explorer") return;

		var movieObj = element.lastChild;
		
		/** This bypasses the "Click to Activate" message **/
		
		/**
		// I originally added this code to work around the "Click to Activate" dialog introduced
		// because of the Eolas patent. It looks, however, as if this is now casuing IE 7 and above
		// to embed two copies of the movie one on top of the other which is only obvious when
		// you pause the visible movie only for the sound to continue to play.
		
		// I've commented out the code so that this no longer happens. I think looking into the
		// Eolas problem in more detail this code isn't needed at all as long as this script is
		// kept in a JS file external to the HTML page.
			
			// find param tags within object
			var params = movieObj.getElementsByTagName('param');
			var inner = '';

			// if there are params, but param tags ca not be found within innerHTML
			if (params.length && !/<param/i.test(movieObj.innerHTML))
			{
				// add all param tags to 'inner' string
				for (var x=0;x < params.length;x++)
				{
					inner += params.item(x).outerHTML;
				}
			}

			// put 'inner' string with param tags in the middle of the outerHTML
			movieObj.outerHTML = movieObj.outerHTML.replace('>', '>' + inner);
			movieObj = element.lastChild;
		**/
		
		/** This comes from the Apple QuickTime scripts **/		
		
		if(!movieObj.GetControllerVisible()) setTimeout( function() { movieObj.SetControllerVisible(true); }, 100);
	},
	
	isQTInstalled: function()
	{
		var qtInstalled = false;
		qtObj = false;
		if (navigator.plugins && navigator.plugins.length)
		{
			for (var i=0; i < navigator.plugins.length; i++ )
			{
				var plugin = navigator.plugins[i];
				if (plugin.name.indexOf("QuickTime") > -1) 
				{
					qtInstalled = true;
				}
			}
		}
		else
		{
			execScript('on error resume next: qtObj = (CreateObject("QuickTimeCheckObject.QuickTimeCheck.1")).IsQuickTimeAvailable(0)','VBScript');
			qtInstalled = qtObj;
		}
		
		return qtInstalled;
	},

	addEvent: function(obj,event,func,capture)
	{
		if (window.addEventListener)
		{
			obj.addEventListener(event,func,capture);
			return true;
		}
		else
		{
			return obj.attachEvent("on" + event,func);
		}
	},
	
	ensureVisible: function(element)
	{
		if (!element.scrollIntoView) return;
		
		var topOfPage = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		var heightOfPage = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		
		var elY = 0;
		var elH = 0;
		
		if (document.layers)
		{ // NS4
			elY = element.y;
			elH = el.height;
		}
		else
		{
			for(var p=element; p&&p.tagName!='BODY'; p=p.offsetParent)
			{
				elY += p.offsetTop;
			}
			elH = element.offsetHeight;
		}
	  
		if ((topOfPage + heightOfPage) < (elY + elH))
		{
			element.scrollIntoView(false);
			if (window.scrollBy) window.scrollBy(0,20);
		}
		else if (elY < topOfPage)
		{
			element.scrollIntoView(true);
			if (window.scrollBy) window.scrollBy(0,-20);
		}
	}
};

QuickTime.addEvent(window,"load",QuickTime.init);