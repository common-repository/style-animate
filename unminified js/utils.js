(function(css3kfa, $, undefined) {
  css3kfa.dialog = function(title, text, callback) {
    function close(obj) {
      $(obj).dialog("close");
      $("#css3kfa-dialog").remove();
    }
    function dialog(title, text) {
      $(document.body).append('<div id="css3kfa-dialog" title="' + title + '"><p>' + text + "</p></div>");
      $("#css3kfa-dialog").dialog({resizable:true, modal:true, dialogClass:"css3kfa-dlg", buttons:callback !== undefined ? {"OK":function() {
        if (callback !== undefined) {
          callback();
        }
        close(this);
      }, Cancel:function() {
        close(this);
      }} : {"OK":function() {
        close(this);
      }}});
    }
    var data = {"action":"css3kfa_translate", "security":css3kfa_vars.css3kfaNonce, "text":text, "title":title};
    $.ajax({url:ajaxurl, data:data, dataType:"json", error:function() {
      console.log("translation error");
      dialog(title, text);
    }, success:function(data) {
      dialog(data.title, data.text);
    }, method:"POST"});
  };
})(window.css3kfa = window.css3kfa || {}, jQuery);

