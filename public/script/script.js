$(document).ready(function() {
  var quill = new Quill('#textarea');
  quill.on('text-change', function(delta, source) {
    if (source == 'user') {
      console.log(quill.getHTML());
      console.log(quill.getText());
      var selection = getSection(quill.getHTML(),quill.getText());
      console.log(selection);
      if(selection !== undefined) {
        if(!selection.full) {
          console.log("COLOR");
          quill.formatText(selection.start, selection.end, "color", "E6BF7E");
          //quill.formatText(selection.end, selection.end, "color", "E6BF7E");
        } else if(selection.full) {
          quill.deleteText(selection.start, selection.end);
          quill.insertText(selection.start, "hello");
        }
      }
    }
  });
});

function getSection (HTMLstr, TEXTstr) {
  var regexpPartial = /(>|\s)[a-zA-Z]\.([a-zA-Z]+|("[a-zA-Z]))/i;
  var regexpFull = /(>|\s)[a-zA-Z]\.([a-zA-Z]+(\s)|("([a-zA-Z]|\s|<)+"(\s)))/i;
  var startPartial = HTMLstr.match(regexpPartial);
  var startPartialTEXT = TEXTstr.match(regexpPartial);
  var startFull = HTMLstr.match(regexpFull);

  if(startPartial === null) return;

  var start = TEXTstr.indexOf(startPartial[0].substring(1),startPartialTEXT.index);


  if(startFull === null) return {"start": start, "end": start + startPartial[0].length,"type": startPartial[0].charAt(1), "value": startPartial[0].substring(3), full: false};


  if(startFull !== null && startPartial.input === startFull.input) return {"start": start, "end": start + startFull[0].length - 1,"type": startFull[0].charAt(1), "value": startFull[0].substring(3,startFull[0].length - 1), full: true};

  return;

  // if (start === -1) return;
  //
  // var end = str.indexOf(delim, start + 1);
  // if (end === -1) return;
  //
  // return str.substr(start, end - start + 3);
}
