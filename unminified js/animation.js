(function(css3kfa, $, undefined) {
  function Animation_cl(animData) {
    this.animData = animData;
    this.active = false;
    this.originalElementChain = animData.elementChain;
    this.elementChain = css3kfa_obj.stripTrailingHash_fn(css3kfa_obj.getBrowserCorrectChain_fn(this.originalElementChain));
    this.$obj = $(this.elementChain);
    if (this.$obj.length === 0) {
      return;
    }
    this.parentChain = css3kfa_obj.getParentCorrectChain_fn(this.elementChain);
    this.isBlockLevel = true;
    this.animType = Number(animData.animType);
    this.postId = animData.id;
    this.isAdmin = animData.admin_url != null;
    this.adminUrl = animData.admin_url;
    this.data = null;
    this.id = "css3kfa-" + this.postId;
    this.hasChanged = false;
    this.dialog = null;
    var obj = $("div#wpadminbar");
    this.adminBarH = obj.length > 0 ? obj.outerHeight() : 0;
    this.markerMenuShowing = false;
    this.markerMoving = false;
    this.uniqueClass = "css3kfa-cl-" + this.postId;
    this.add_fn();
    this.setTooltip_fn(animData.name);
    this.dlgTransShowing = false;
    css3kfa_obj.currentAnimation = this;
  }
  css3kfa.Animation_cl = Animation_cl;
  Animation_cl.prototype = {showOutline_fn:function() {
    css3kfa_obj.appendReticle_fn(this.$obj);
  }, fadeOutline_fn:function(t) {
    $(".css3kfa-reticle").fadeOut(t, function() {
      css3kfa_obj.removeReticle_fn();
    });
  }, add_fn:function() {
    this.elementChain = css3kfa_obj.stripTrailingHash_fn(this.elementChain);
    var anims = css3kfa_obj.anims;
    if (this.isAdmin === true) {
      this.$obj = $(this.elementChain);
      if (this.$obj.length === 0) {
        return;
      }
      this.isBlockLevel = css3kfa_obj.isBlockDisplay_fn(this.$obj);
      css3kfa_obj.highestZ++;
      this.markerId = this.id + "-marker";
      var d = '<div class="css3kfa-marker" id="' + this.markerId + '" title="" alt=""></div>';
      $("body").append(d);
      var anim = this;
      this.fixIfUnattached_fn();
      $("#" + this.markerId).css(" z-index", 0).contextmenu(function() {
        return false;
      });
      var postId = this.postId;
      $("#" + this.markerId).on("mouseup", function(e) {
        if (e.which === 3 || anim.markerMoving === false) {
          var other = null;
          if (css3kfa.timeline !== null) {
            other = css3kfa.timeline.animation;
            css3kfa_obj.deactivate_fn();
            other.closeEditor_fn();
            if (other === anim) {
              anim.hidePanes_fn();
              css3kfa.timeline.cleanup_fn();
              css3kfa.timeline = null;
              return;
            }
          }
          css3kfa.editor.startWaiting_fn(anim.animType, false);
          anim.showOutline_fn();
          var data = {"action":"css3kfa_getanim", "security":css3kfa_vars.css3kfaNonce, "id":postId};
          $.ajax({url:ajaxurl, data:data, dataType:"json", error:function() {
          }, success:function(data) {
            anim.showUI_fn(data[0]);
            anim.fadeOutline_fn(2000);
          }, method:"POST"});
        }
        anim.markerMoving = false;
      });
      anims.push(this);
      this.setBasePosition_fn();
      this.moveMarker_fn();
    }
  }, deleteTimeline_fn:function() {
    var anim = this;
    var singleElement = css3kfa_obj.isOnSingleElement_fn(css3kfa.timeline.getFirstBlock_fn().elementID);
    $("#css3kfa-delete_html").dialog({resizable:false, height:200, width:300, modal:true, dialogClass:"css3kfa-dlg", buttons:{"OK":function() {
      if (css3kfa.timeline.rootLayer != null) {
        css3kfa.timeline.rootLayer.cleanupAll_fn();
      }
      css3kfa_obj.positionMarkers_fn();
      var data = {"action":"css3kfa_delete", "security":css3kfa_vars.css3kfaNonce, "id":anim.postId};
      $.ajax({url:ajaxurl, data:data, error:function() {
        console.log("error");
      }, success:function(data) {
        if (data == "error") {
          console.log("error code returned");
        } else {
          if (!singleElement) {
            css3kfa_obj.reloadDialog_fn();
          }
        }
      }, method:"POST"});
      for (var i = 0; i < css3kfa_obj.anims.length; i++) {
        var _anim = css3kfa_obj.anims[i];
        if (_anim === anim) {
          css3kfa_obj.anims.splice(i, 1);
          break;
        }
      }
      anim.close_fn();
      $("#" + anim.markerId).remove();
      $(this).dialog("close");
    }, Cancel:function() {
      $(this).dialog("close");
    }}});
  }, setTooltip_fn:function(tooltip) {
    this.tooltip = tooltip !== undefined ? tooltip : this.tooltip;
    $("#" + this.markerId).prop("title", this.tooltip);
    $("#" + this.markerId).prop("alt", this.tooltip);
  }, setBasePosition_fn:function() {
    if (this.$obj.offset() !== undefined) {
      this.top = this.$obj.offset().top;
      this.left = this.$obj.offset().left - 24;
      if (this.top < 5 + this.adminBarH) {
        this.top = 5 + this.adminBarH;
      }
      if (this.left < 5) {
        this.left = 5;
      }
    }
  }, moveMarker_fn:function() {
    this.setBasePosition_fn();
    var i, anim, markerId, left, top, loffset, toffset, anims = css3kfa_obj.anims;
    for (i = 0; i < anims.length; i++) {
      anim = anims[i];
      markerId = anim.markerId;
      if (this.markerId != markerId) {
        left = $("#" + markerId).offset().left;
        top = $("#" + markerId).offset().top;
        loffset = Math.abs(this.left - left);
        toffset = Math.abs(this.top - top);
        if (loffset < 20 && toffset < 20) {
          this.left += 20 - loffset;
          this.top += 20 - toffset;
        }
      }
    }
    $("#" + this.markerId).css({"left":this.left + "px", "top":this.top + "px"});
  }, hidePanes_fn:function() {
    var top = $(window).height();
    $("#css3kfa-editorpane").animate({height:"0", top:top + "px"}, 500, function() {
      $(".css3kfa-editor-spacer").remove();
      css3kfa.timeline = null;
    });
    $("#css3kfa-stylepane").fadeOut();
  }, close_fn:function() {
    css3kfa_obj.deactivate_fn();
    this.closeEditor_fn();
    this.hidePanes_fn();
    css3kfa.timeline.cleanup_fn();
    css3kfa.timeline = null;
  }, closeEditor_fn:function() {
    this.saveAccordions_fn();
    $("#" + this.markerId).css("background-position", "0px 0px");
    $("#css3kfa-timeline-menubutton").off();
    if (css3kfa.timeline != null) {
      css3kfa.timeline.closeDialogs_fn();
    }
    css3kfa.editor.close_fn();
    $(window).off("resize", css3kfa_obj.positionStylePane_fn);
    $(".css3kfa-marker").show();
    this.active = false;
  }, saveAccordions_fn:function() {
    if (css3kfa.timeline != null) {
      css3kfa_obj.openAccordions = [];
      var styles = css3kfa.timeline.defaultStyles.styles;
      for (var i = 0; i < styles.length; i++) {
        css3kfa_obj.openAccordions.push(styles[i].open);
      }
    }
  }, showInitialStyles_fn:function() {
    if (this.isAdmin === true) {
      if (this.animData != null && this.animData.data !== "") {
        this.data = JSON.parse(this.animData.data);
      }
      css3kfa.DefaultStyles_element = this.$obj;
      var data = this.data, postID = this.postId, animType = this.animType, currTimeline = css3kfa.timeline, timeline = new css3kfa.Timeline_cl(postID, animType);
      timeline.animation = this;
      timeline.deserialize_fn(this.data);
      timeline.drawScene_fn(0);
      css3kfa.timeline = currTimeline;
      css3kfa_obj.positionMarkers_fn();
    }
  }, showUI_fn:function(animData) {
    if (css3kfa.timeline != null && css3kfa.timeline.animation != null) {
      $("#" + css3kfa.timeline.animation.markerId).css("background-position", "0px 0px");
    }
    if (animData != null && animData.data !== "") {
      this.data = JSON.parse(animData.data);
    }
    var i, openAccordions = css3kfa_obj.openAccordions, data = this.data, postID = this.postId, elementID = this.elementChain, parentID = this.parentChain, animType = this.animType;
    if (css3kfa.timeline != null) {
      this.saveAccordions_fn();
      openAccordions = [];
      for (i = 0; i < css3kfa.timeline.defaultStyles.styles.length; i++) {
        openAccordions.push(css3kfa.timeline.defaultStyles.styles[i].open);
      }
      css3kfa.timeline.cleanup_fn();
      css3kfa.timeline = null;
    }
    css3kfa.DefaultStyles_element = this.$obj;
    css3kfa.timeline = new css3kfa.Timeline_cl(postID, animType);
    css3kfa.timeline.animation = this;
    $("#" + this.markerId).css("background-position", "-36px 0px");
    if (css3kfa.editor.stylepane == null) {
      this.stylepane = new css3kfa.Stylepane(css3kfa.timeline);
    } else {
      this.stylepane = css3kfa.editor.stylepane;
    }
    $("#css3kfa-editorpane").css({"display":"block"});
    if (data == null) {
      css3kfa.timeline.preInit_fn(elementID, parentID);
    } else {
      css3kfa.timeline.deserialize_fn(data);
    }
    if (css3kfa.Block_displayReverse === true) {
      $("#css3kfa-tl-lyr-window").scrollTop(2000);
    }
    var block = css3kfa.timeline.getFirstBlock_fn();
    css3kfa.timeline.selectedBlock = block;
    css3kfa.timeline.drawTimeline_fn();
    css3kfa.timeline.display_fn();
    $("#css3kfa-editorpane").css("display", "none");
    css3kfa.editor.init_fn(block, this.stylepane, animType === 0 ? false : true);
    css3kfa.timeline.postDeserialize_fn();
    css3kfa.Block_lastHighltKF = "tbf-0-0";
    if (this.animType == 2) {
      $("#css3kfa-animtype").attr("title", "Transition saved").attr("alt", "Transition saved").css("background-position", "-20px 0px");
    } else {
      $("#css3kfa-animtype").attr("title", "Keyframe animation saved").attr("alt", "Keyframe animation saved").css("background-position", "0px 0px");
    }
    if (openAccordions.length > 0) {
      for (i = 0; i < openAccordions.length; i++) {
        css3kfa.timeline.defaultStyles.styles[i].open = openAccordions[i];
      }
    }
    this.stylepane.resizeOnMenu_fn();
    this.active = true;
    css3kfa.editor.stopWaiting_fn();
    css3kfa_obj.positionStylePane_fn(false, true);
    $(window).on("resize", css3kfa_obj.positionStylePane_fn);
  }, fixIfUnattached_fn:function() {
    if (this.elementChain === "BODY") {
      $("#" + this.id).css("position", "fixed");
      $("#" + this.containerId).css("position", "fixed");
    } else {
      $("#" + this.id).css("position", "absolute");
      $("#" + this.containerId).css("position", "absolute");
    }
  }, changeBaseElement_fn:function(newPageID) {
    var $obj = $(this.originalElementChain);
    var elementChain = css3kfa_obj.getElementChain_fn($obj);
    var anim = this;
    var data = {"action":"css3kfa_update_elementchain", "security":css3kfa_vars.css3kfaNonce, "id":anim.postId, "elementchain":elementChain};
    $.ajax({url:ajaxurl, data:data, error:function() {
      console.log("error changing base element (1)" + anim.postId);
    }, success:function(data) {
      if (data === "error") {
        console.log("error changing base element (2)" + anim.postId);
      }
    }, method:"POST"});
    return elementChain;
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

