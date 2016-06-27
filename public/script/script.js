$(document).ready(function() {
  var dictionary = {}; //create front-end stored dictionary

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
  quill.getEditedText = function() {
    return " " + quill.getText();
  }
  var toolbar = quill.addModule('toolbar', {
    container: '#toolbar'
  });
  $("#textarea").on("keydown", function (e) {
    if(e.keyCode === 38 && e.altKey && !e.shiftKey) {
      return false;
    } else if (e.keyCode === 40 && e.altKey && !e.shiftKey) {
      return false;
    }
  });
  $("#textarea").on("keyup", function (e) {

    //Detect Change
    var range = quill.getSelection();
    var indexOfLastWord = quill.getEditedText().lastIndexOf(" ", range.start - 1);
    var selectedWord = quill.getEditedText().substring(indexOfLastWord + 1,range.start + 1);
    for(var h in dictionary) {
      for(var i in dictionary[h]) {
        storedWord = dictionary[h][i];
        if(storedWord.current == selectedWord) {
          quill.formatText(indexOfLastWord, range.start, "color", "#98C376");
          if(e.keyCode === 38 && e.altKey && !e.shiftKey) {
            if(storedWord.currentIndex == storedWord["result"].length - 1) storedWord.currentIndex = 0;
            quill.deleteText(indexOfLastWord, range.start);
            quill.insertText(indexOfLastWord, storedWord["result"][++storedWord.currentIndex]);
            storedWord.current = storedWord["result"][storedWord.currentIndex];
          } else if (e.keyCode === 40 && e.altKey && !e.shiftKey) {
            if(storedWord.currentIndex == 0) storedWord.currentIndex = storedWord["result"].length - 1;
            quill.deleteText(indexOfLastWord, range.start);
            quill.insertText(indexOfLastWord, storedWord["result"][--storedWord.currentIndex]);
            storedWord.current = storedWord["result"][storedWord.currentIndex];
          }
          return;
        } else if(e.keyCode === 32 && (storedWord.current + " ") == selectedWord) {
          storedWord.current = null;
          storedWord.currentIndex = -1;
          quill.deleteText(indexOfLastWord, range.start);
          quill.insertText(indexOfLastWord, selectedWord.replace(/_/g," ").substring(0,selectedWord.length-1));
        }
      }
    }

    //Detect Command
    var selection = detectCommand(quill.getEditedText(),e);
    if(selection !== undefined) {
      if(selection.clear == true) quill.clearText();
      if(!selection.full) {
        quill.clearText();
        quill.formatText(selection.start, selection.end, "color", "E6BF7E");
      } else {
        if(dictionary[selection.value] && dictionary[selection.value][selection.type]) {
          quill.deleteText(selection.start, selection.end);
          quill.insertText(selection.start, dictionary[selection.value][selection.type]["result"][0]);
          dictionary[selection.value][selection.type].currentIndex = 0;
          dictionary[selection.value][selection.type].current = dictionary[selection.value][selection.type]["result"][0];
          quill.clearText();
        } else {
          $.post("/search",{type: selection.type, value: selection.value}, function(data){
            console.log(data);
            dictionary[selection.value] = {};
            for(var index in data.result) {
              dictionary[selection.value][index] = {};
              dictionary[selection.value][index]["result"] = data.result[index];
              dictionary[selection.value][index].currentIndex = -1;
            }
            if(data.success) {
              quill.deleteText(selection.start, selection.end);
              quill.insertText(selection.start, data.result[selection.type][0]);
              dictionary[selection.value][selection.type].current = data.result[selection.type][0];
              dictionary[selection.value][selection.type].currentIndex = 0;
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
    }
  });
});

function detectCommand(TEXTstr,key) {
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
