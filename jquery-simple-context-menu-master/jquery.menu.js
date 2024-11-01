
 /*Modified by R.Watton to use menu as a pop-up when a specific element is clicked*/
jQuery.fn.css3kfa_menu = function(menuData) {

	// Define default obj.settings
	this.settings = {
		contextMenuClass: 'contextMenuPlugin',
        linkClickerClass: 'contextMenuLink',
		gutterLineClass: 'gutterLine',
		headerClass: 'header',
		seperatorClass: 'divider'
	};
	

	// merge them
	jQuery.extend(this.settings, menuData);

	var obj=this;
  // Build popup menu HTML
  function createMenu(e) {
    var menu = jQuery('<ul class="' + obj.settings.contextMenuClass + '"><div class="' + obj.settings.gutterLineClass + '"></div></ul>')
      .appendTo('#css3kfa-cover');
    obj.menu=menu;
    if (obj.settings.title) {
      jQuery('<li class="' + obj.settings.headerClass + '"></li>').text(obj.settings.title).appendTo(menu);
    }
    obj.settings.items.forEach(function(item) {
      if (item) {
        var rowCode = '<li><a href="#" class="'+obj.settings.linkClickerClass+'">'+((item.icon) ? '<img src="'+item.icon+'">' : '')+'<span class="itemTitle">' + item.label + '</span></a></li>';
        var row = jQuery(rowCode).appendTo(menu);
          
        if (item.isEnabled != undefined && !item.isEnabled()) {
            row.addClass('disabled');
        } else if (item.action) {
            row.find('.'+obj.settings.linkClickerClass).on('mouseup',function () { item.action(e); });
        }

      } else {
        jQuery('<li class="' + obj.settings.seperatorClass + '"></li>').appendTo(menu);
      }
    });
    menu.find('.' + obj.settings.headerClass ).text(obj.settings.title);
    
    return menu;
  }

  jQuery('.'+obj.settings.element).on("mouseup", function(e) {
	  
	if (css3kfa_menu!==null) css3kfa_menu.remove();
	css3kfa_menu=null;
	if (css3kfa_bg !== null) css3kfa_bg.css({'display':'none'});
	
    // Cover rest of page with invisible div that when clicked will cancel the popup. This is fixed so is attached to editor pane for correct z ordering
    var z=jQuery('#css3kfa-stylepane').css('z-index');
    css3kfa_bg = jQuery('#css3kfa-cover');
    css3kfa_bg.css({'display':'block','left':'0', 'top':'0','z-index':z+1})
      .on('contextmenu click', function() {
    	  css3kfa_bg.css({'display':'none'});
    	  if (css3kfa_menu!==null) css3kfa_menu.remove();
    	  css3kfa_menu=null;
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
    return this;
  });

}

