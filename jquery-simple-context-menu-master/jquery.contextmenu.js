/**
 * jQuery plugin for Pretty looking right click context menu.
 *
 * Requires popup.js and popup.css to be included in your page. And jQuery, obviously.
 *
 * Usage:
 *
 *   jQuery('.something').contextPopup({
 *     title: 'Some title',
 *     items: [
 *       {label:'My Item', icon:'/some/icon1.png', action:function() { alert('hi'); }},
 *       {label:'Item #2', icon:'/some/icon2.png', action:function() { alert('yo'); }},
 *       null, // divider
 *       {label:'Blahhhh', icon:'/some/icon3.png', action:function() { alert('bye'); }, isEnabled: function() { return false; }},
 *     ]
 *   });
 *
 * Icon needs to be 16x16. I recommend the Fugue icon set from: http://p.yusukekamiyamane.com/ 
 *
 * - Joe Walnes, 2011 http://joewalnes.com/
 *   https://github.com/joewalnes/jquery-simple-context-menu
 *
 * MIT License: https://github.com/joewalnes/jquery-simple-context-menu/blob/master/LICENSE.txt
 */
var css3kfa_menu=null;
var css3kfa_bg=null;
jQuery.fn.css3kfa_contextPopup = function(menuData) {
	// Define default settings
	var settings = {
		contextMenuClass: 'contextMenuPlugin',
        linkClickerClass: 'contextMenuLink',
		gutterLineClass: 'gutterLine',
		headerClass: 'header',
		seperatorClass: 'divider'
	};
	

	// merge them
	jQuery.extend(settings, menuData);

  // Build popup menu HTML
  function createMenu(e) {
    var menu = jQuery('<ul class="' + settings.contextMenuClass + '"><div class="' + settings.gutterLineClass + '"></div></ul>')
      .appendTo('#css3kfa-cover');
    if (settings.title) {
      jQuery('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
    }
    settings.items.forEach(function(item) {
      if (item) {
        var rowCode = '<li><a href="#" class="'+settings.linkClickerClass+'">'+((item.icon) ? '<img src="'+item.icon+'">' : '')+'<span class="itemTitle">' + item.label + '</span></a></li>';
        var row = jQuery(rowCode).appendTo(menu);
          
        if (item.isEnabled != undefined && !item.isEnabled()) {
            row.addClass('disabled');
        } else if (item.action) {
            row.find('.'+settings.linkClickerClass).on('mouseup',function () { item.action(e); });
        }

      } else {
        jQuery('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
      }
    });
    menu.find('.' + settings.headerClass ).text(settings.title);
    return menu;
  }


  // On contextmenu event (right click)
  this.on('contextmenu', function(e) {
	if (css3kfa_menu!==null) css3kfa_menu.remove();
	css3kfa_menu=null;
	if (css3kfa_bg !== null) css3kfa_bg.css({'display':'none'});
	  
    // Cover rest of page with invisible div that when clicked will cancel the popup.
	var z=jQuery('#css3kfa-editorpane').css('z-index');
	css3kfa_bg = jQuery('#css3kfa-cover');
	css3kfa_bg.css({'display':'block','left':'0', 'top':'0','z-index':z+1})
      .on('contextmenu click', function() {
        // If click or right click anywhere else on page: remove clean up.
    	  css3kfa_bg.css({'display':'none'});
    	  if (css3kfa_menu!==null) css3kfa_menu.remove();
    	  css3kfa_menu=null;
        return false;
      });
   
	css3kfa_menu = createMenu(e).show();
    var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
    	top = e.pageY-jQuery(window).scrollTop();
    if (top + css3kfa_menu.height() >= jQuery(window).height()) {
        top -= css3kfa_menu.height();
    }
    if (left + css3kfa_menu.width() >= jQuery(window).width()) {
        left -= css3kfa_menu.width();
    }

    // Create and show menu
    css3kfa_menu.css({'left':left, 'top':top,'position':'fixed'})
      .on('contextmenu', function() { return false; });

    // When clicking on a link in menu: clean up (in addition to handlers on link already)
    css3kfa_menu.find('a').on('mouseup',function() {
    css3kfa_bg.css({'display':'none'});
	if (css3kfa_menu!==null) css3kfa_menu.remove();
	css3kfa_menu=null;
    });

    // Cancel event, so real browser popup doesn't appear.
    return false;
  });

  return this;
};

