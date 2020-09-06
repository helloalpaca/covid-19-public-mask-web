const maskURL = 'https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByAddr/json?address=';
const input = document.getElementById('input');
const button = document.getElementById('button');
const list = document.getElementById('list');
const googleMap = document.getElementById('googleMap');

var map;
var jsonData;

button.addEventListener('click', getInputData);

// initialize googleMap
function initMap() {
  // center coordinate of Korea
  var centerofKorea = { lat: 35.95, lng: 128.24 };
  // set center of the map at centerofKorea.
  map = new google.maps.Map(googleMap, {
    zoom: 7,
    center: centerofKorea
  });
}

// function of button
function getInputData() {
  $(list).empty(); // remove the contents of the existing list.

  var addr = "";
  if (input.value==""){ addr = "부산광역시 금정구 장전동"; }
  else { addr = input.value; } // get input data

  sendHttpRequest('GET', maskURL+addr); // get Mask data
}

// function that use XMLHttpRequest to get data provided by URL.
function sendHttpRequest(method, url) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.responseType = 'json'
  xhr.onload = () => {
    var data = xhr.response;
    jsonData = data.stores;
    addList(data.stores);
    addMarker(data.stores);
  };
  xhr.send();
}

// add pharmacies to the list
function addList(jsonObject) {
  for (var i = 0; i < jsonObject.length; ++i) {
    var temp = document.createElement("ul"); // create ul element
    temp.setAttribute("style", "padding:0; margin:0;");

    // change the color of li according to the data in remain_stat.
    var color = "";
    if(jsonObject[i].remain_stat=="plenty") color = "success";
    else if(jsonObject[i].remain_stat=="some") color = "warning";
    else if(jsonObject[i].remain_stat=="few") color = "danger";
    else if(jsonObject[i].remain_stat=="empty") color = "dark";
    else color = "list-group-item-light";

    // add the name of pharmacy and two buttons to the ul.
    temp.innerHTML = "<li class='list-group-item list-group-item-"+color+"' style='width:300px; float: left;'>" + jsonObject[i].name + "</li>";
    temp.innerHTML += "<button type='button' class='btn btn-light' style='width:100px; float: left;' id='moreinfoBtn"+i+"'>상세정보</button>";
    temp.innerHTML += "<button type='button' class='btn btn-light' style='width:100px; float: left;' id='locationBtn"+i+"'>위치</button>";
    list.appendChild(temp); // add ul to the list.

    // connect the button to the click event.
    var moreinfoBtn = document.getElementById('moreinfoBtn'+i);
    moreinfoBtn.addEventListener('click', getMoreInfo);
    var locationBtn = document.getElementById('locationBtn'+i);
    locationBtn.addEventListener('click', changeLocation);
  }
}

// shows details of the pharmacy information.
function getMoreInfo(){
  var index = $(this).parent().index(); //gets the index of the ul that button pressed.
  window.alert("이름: "+jsonData[index].name
  +"\n주소: "+jsonData[index].addr
  +"\n입고시간: "+jsonData[index].stock_at
  +"\n판매처 유형: "+getType(jsonData[index].type)
  +"\n식별코드: "+jsonData[index].code);
}

// returns the type according to type code.
function getType(typecode){
  var type = "";
  if(typecode=="01") type="약국";
  else if(typecode=="02") type="우체국";
  else type="농협";
  return type;
}

// makes center of google map becomes selected pharmacy location.
function changeLocation(){
  var index = $(this).parent().index(); //gets the index of the ul that button pressed.
  var center = { lat: jsonData[index].lat, lng: jsonData[index].lng }; // get pharmacy location.
	map.panTo(center); // change map location.
  map.setZoom(19); // change map zoom level.
}

// add marker to google map
function addMarker(jsonObject) {
  // change center of map to first pharmacy location.
  var center = { lat: jsonObject[0].lat, lng: jsonObject[0].lng };
  map.panTo(center);
  map.setZoom(15);
  // mark the pharmacy location.
  for (var i = 0; i < jsonObject.length; ++i) {
    var places = { lat: jsonObject[i].lat, lng: jsonObject[i].lng };
    new google.maps.Marker({
      position: places,
      map: map,
      label: jsonObject[i].name
    });
  }
}
