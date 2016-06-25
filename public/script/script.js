$(document).ready(function() {
  var quill = new Quill('#textarea');
  quill.focus();
  quill.clearText = function(start,end) {
    if(!start) start = 0;
    if(!end) end = this.getLength();
    this.formatText(start, end, {
        'bold':false,
        'italic':false,
        'strike':false,
        'underline':false,
        'font':false,
        'size':false,
        'color':false,
        'background':false
    });
  }
  //quill.on('text-change', function(delta, source, key) {
    //if(delta.ops[delta.ops.length -1].insert) console.log(delta.ops[delta.ops.length -1].insert.charCodeAt(0));
  $("#textarea").keyup(function(e) {
    //if (source == 'user') {
    var selection = getSection(quill.getText(),e);
    if(selection !== undefined) {
      if(selection.clear == true) quill.clearText();
      if(!selection.full) {
        quill.clearText(0);
        quill.formatText(selection.start, selection.end, "color", "E6BF7E");
      } else {
        $.post("/search",{type: selection.type, value: selection.value}, function(data){
          console.log(data);
          if(data.success) {
            quill.deleteText(selection.start, selection.end);
            quill.insertText(selection.start, data.result[0]);
            quill.clearText();
          } else {
            quill.formatText(selection.start, selection.end, "color", "red");
            quill.deleteText(selection.start, selection.end);
            quill.insertText(selection.start, "fail");
            quill.clearText();
          }
        });
      }
    }
  });
});

function getSection (TEXTstr,key) {
  TEXTstr = (" " + TEXTstr);
  var regexpPartial = /(\s)[a-zA-Z]\.(([a-zA-Z]+)|("[a-zA-Z]))/i;
  var regexpFull = /(\s)[a-zA-Z]\.([a-zA-Z]+(\s)|("([a-zA-Z]|\s)+"(\s)))/i;
  var startPartial = TEXTstr.match(regexpPartial);
  var startFull = TEXTstr.match(regexpFull);

  //{"start": start - 1, "end": start + startFull[0].length - 1, "type": startFull[0].charAt(1), "value": startFull[0].substring(3,startFull[0].length - 1), "full": true}

  if(startPartial === null) return {"start": 0, "end": 0,"type": 0, "value": 0, "clear": true,"full": false};

  var start = TEXTstr.indexOf(startPartial[0],0);

  if(startFull === null) return {"start": start, "end": start + startPartial[0].length - 2,"type": startPartial[0].charAt(1), "value": startPartial[0].substring(3), "full": false};


  if(startFull !== null && startPartial.input === startFull.input && key.keyCode == 32) return {"start": start, "end": start + startFull[0].length - 1, "type": startFull[0].charAt(1), "value": startFull[0].substring(3,startFull[0].length - 1), "full": true};

  if(startFull !== null && startPartial.input === startFull.input) return {"start": start, "end": start + startFull[0].length - 1,"type": startFull[0].charAt(1), "value": startFull[0].substring(3,startFull[0].length - 1), "full": false};

  return "nothing";
}
