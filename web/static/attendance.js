function sendRequest(isPost, data, header, value, urlAddOn)  {
    var xhr = new XMLHttpRequest();
    xhr.open(isPost? "POST": "GET", urlAddOn, true);
    xhr.setRequestHeader(header, value);
    var data = JSON.stringify({"text": theirText});
    xhr.send(data);
    return xhr.responseText;
}


function sendSubmitForm()  {
    theirText = document.getElementById("someRandoText").value
    console.log(theirText)

    console.log('theirText:' + sendRequest(true, theirText, "attendance-json", "application/json", "/addText"));
}

function showSuggestions(curText) {
    alert(curText);
    newJson = sendRequest(false, "", "", "", "/autofill/" + curText);

    ourJson = '[{"name" : "Ashwin", "age" : "20"},{"name" : "Abhinandan", "age" : "20"}]';
    var list = document.getElementById("suggestedStudents");
    var myData = JSON.parse(ourJson);
    inner = "";
    for (i in myData) {
      inner += "<option>" + myData[i].name + "</option>\n";
    }
    list.innerHTML = inner;
}



function onAddRow() {
    var table = document.getElementById("Attendance-Table");
    var keywordElement = document.getElementById('keyword').value;
    if (keywordElement != ""){
    document.getElementById("nameEnter").reset();
    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    str = '<form> <input type="checkbox"></form>';
    cell1.innerHTML = keywordElement;
    cell2.innerHTML = str;
    cell3.innerHTML = str;
    }

}
