<html>
<head>
<script src="./jquery-3.2.1.min.js"></script>
<script src="./shaka-player.compiled.js"></script>
<!--<script src="./shaka-player.compiled.debug.js"></script>-->
<script src="./dash.all.debug.js"></script>
<title>
Media playback Test
</title>
<script type="text/javascript">
var video_width = 720;
var video_height = 400;
var media_id = 1;
var video_urls = [
  "media/sintel_trailer-1080p.mp4",
  "media/twice_signal_teaser_640x360.mp4",
  "media/produce48.mp4",
  "media/big_buck_bunny_480p.webm",
];

var hidden_video = document.createElement("DIV");
var att = document.createAttribute("id");       // Create a "class" attribute
att.value = "hidden";                           // Set the value of the class attribute
hidden_video.setAttributeNode(att);

function create_video_tag(parent) {
  player_type = $('#player-type')[0].value
  use_texture = $('input:checkbox[name="texture"]').is(":checked")
  noaudio = $('input:checkbox[name="noaudio"]').is(":checked")
  sw = $('input:checkbox[name="sw"]').is(":checked")
  autoplay = $('input:checkbox[name="autoplay"]').is(":checked")
  attrs = ""
  type = ""
  if (noaudio)
    attrs += " noaudio ";
  if (use_texture)
    attrs += " texture ";
  if (sw)
    type += " type=\"video/mp4;decoder=sw\" ";
  if (autoplay)
    attrs += " autoplay ";

  attrs += "preload='" + $("#preload")[0].value + "'";
  id = "media"+media_id++;
  var el = document.getElementById(parent);
  if (parent == "hidden_video") {
    el = hidden_video;
  }
  if (player_type == "url") {
    var video_url = $("#video-url option:selected").text()
        video_tag = "<video id='" + id + "' controls " + attrs + " loop >"
            + "<source " + type + " src='" + video_url + "' >"
            + "Your browser does not support the video tag."
            + "</video>"
    el.innerHTML = video_tag;
  } else if (player_type == "ext") {
    el.innerHTML = "<video id='" + id + "' controls " + attrs + " >"
            + "<source src='ext://hdmi:1' type='service/webos-external'>"
            + "Your browser does not support the video tag."
            + "</video>"
  } else if (player_type == "mse") {
    el.innerHTML = "<video id='" + id +"' " + attrs + " width='640' poster='//shaka-player-demo.appspot.com/assets/poster.jpg' controls></video>";
    initPlayer(el);

   // el.innerHTML = "<iframe id='youtube' width='1024' height='768' src='https://www.youtube.com/embed/VQtonf1fv_s' frameborder='0' allowfullscreen></iframe>"
  } else if (player_type == "embed") {
    type = "video/webm" // use webm type that media plugin does not support to avoid handling by media plugin
    var video_url = $("#video-url option:selected").text()
        video_tag = "<b>Embed tag</b></br>" + "<embed type='" + type + "' src='" + video_url + "' width=640 height=320 >" + "</embed>"
    el.innerHTML = video_tag;
  } else if (player_type == "object") {
    type = "video/webm" // use webm type that media plugin does not support to avoid handling by media plugin
    var video_url = $("#video-url option:selected").text()
	video_tag =  "<b>Object tag</b></br>" + "<object type='" + type + "' data='" + video_url + "' width=640 height=320 >" + "</object>"
    el.innerHTML = video_tag;
  } else if (player_type == "iframe") {
    type = "video/webm" // use webm type that media plugin does not support to avoid handling by media plugin
    var video_url = $("#video-url option:selected").text()
        video_tag = "<b>iframe tag</b></br>"+ "<iframe type='" + type + "' src='" + video_url + "' width=640 height=320 >" + "</iframe>"
    el.innerHTML = video_tag;
  }
  apply_css(id);
  update_css_update_button();
}

var video = null;
function remove_video_tag(parent) {
  var el = document.getElementById(parent);
  //video = $("#video_container2 video").remove()
  video = el.querySelector('video');
  video.remove();
}

function loop(parent) {
  var el = document.getElementById(parent);
  video = el.querySelector('video');
  var loop = video.loop;
  var el_loop = document.getElementById("set_loop");

  if (loop) {
    video.loop = false;
    el_loop.innerHTML = "<b>Loop is Off</b>";
  } else {
    video.loop = true;
    el_loop.innerHTML = "<b>Loop is On</b>";
  }
}

function apply_css(id) {
    $("#"+id).css("object-fit",$("#object-fit")[0].value);
    $("#"+id).css("display",$("#css-display")[0].value);
    $("#"+id).css("visibility",$("#css-visibility")[0].value);
    $("#"+id).addClass("video");
}

function update_css_update_button() {
  var el = $("#apply-css");
  el.empty()
  $("video").each(function () {
    id = $(this).attr("id");
    el.append("<input style='height:40;' type=button value='Set CSS("+id+")' onclick='apply_css(\""+id+"\")'; /> <br>");
  });
}

function add_space(type) {

  if (type=='v') {
      $("#top").height($("#top").height() + 100);
      $("#bottom").height($("#bottom").height() + 100);
  } else if (type=='h') {
      $("#top").width($("#top").width() + 100);
      $("#bottom").width($("#bottom").width() + 100);
  }
}

$(document).ready(function () {
  $(".controller").on("click", "label", function(event)
  {
    radio_value = $(this).prev(":radio").val();
    $("#clicked").html(radio_value);
  });
  $('input[name="object-fit"]:radio').change(function() {
    if ($('video[id="media"]').length) {
      $('video[id="media"]').css("object-fit", $('input[name="object-fit"]:checked').val() )
    }
  });

  initPlayerURL();
  $('select[id="player-type"]').change(function() {
      initPlayerURL()
  });
  $('select[id="player-type"]').trigger("change");
});

var mse_urls = [
  "dash/mina/mina.mpd",
  "dash/twice_dash/twice_signal_teaser.mpd",
  "dash/produce48_dash/produce48.mpd",
  "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
  "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
  "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd",
];

function initPlayerURL() {
 var urls = video_urls;
 if ($('#player-type')[0].value == "mse")
     urls = mse_urls
 $("#video-url").empty();
  urls.forEach( function (value, idx) {
      $("#video-url").append($('<option>', {
        value: idx,
        text: value
        }));
  });
}

function initPlayer(el) {
  var url = $("#video-url option:selected").text()

  if (false) {
      var video = el.querySelector('video');
      var player = dashjs.MediaPlayer().create();
      player.initialize(video, url, true);
  } else {
      // Create a Player instance.
      var video = el.querySelector('video');
      //var video = document.getElementById('video');
      var player = new shaka.Player(video);

      // Attach player to the window to make it easy to access in the JS console.
      window.player = player;

      //player.configure('streaming.rebufferingGoal', 60);
      //player.configure('streaming.bufferingGoal', 120);

      // Listen for error events.
      player.addEventListener('error', onErrorEvent);

      // Try to load a manifest.
      // This is an asynchronous process.
      player.load(url).then(function() {
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!');
      }).catch(onError);  // onError is executed if the asynchronous load fails.
  }

}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error, 'detail', error.data[2]);
}

</script>
<style>
body {
background: white;
}
#controller {
    position: sticky;
    top: 10;
    left: 20;
    background-color: white;
    font-size: 32;
}
select {
  height:40px;
  font-size:32;
  vertical-align:text;
}
input[type="checkbox"] {
  size: 30px;
  margin-top: -1px;
  vertical-align: middle;
}
#video_container {
    display: block;
    margin-left: 30px;
}

.video {
color: #fff;
}

video {
  width: 800px;
  height: 440px;
  border:4px solid green;
}
input {
    margin-top: 2px;
    height: 35px;
    font-size: 32;
}
label {
    height: 40px;
    font-size: 30px;
}
.create-video {
  border:4px solid green;
}
.modify-video {
  border:4px solid green;
}
#top {
  height: 20px;
}
#bottom {
  height: 0px;
}
</style>
</head>
<body>
<div style="height:1080px; overflow:scroll">
  <div id="controller" class="controller">
      <div class="create-video">
        <span>Player-Type</span>
        <select id="player-type">
            <option value="url" selected>url-player</option>
            <option value="mse">mse-player</option>
            <option value="ext">ext-input</option>
            <option value="embed">embed-tag</option>
            <option value="object">object-tag</option>
            <option value="iframe">iframe-tag</option>
        </select>
        <input type="checkbox" id="texture" name="texture" /><label for="texture">Texture property</label>
        <input type="checkbox" id="noaudio" name="noaudio" /><label for="noaudio">NoAudio property</label>
        <input type="checkbox" id="autoplay" name="autoplay" /><label for="autoplay">Autoplay property</label>
        <input type="checkbox" id="sw" name="sw" /><label for="sw">SW decoder property(UMS only)</label> <br>
        <input style="height:40;" type=button value="Create Video1 TAG" onclick="create_video_tag('video_container');" />
        <input style="height:40;" type=button value="Create Video2 TAG" onclick="create_video_tag('video_container2');" />
        <input style="height:40;" type=button value="Remove Video1 TAG" onclick="remove_video_tag('video_container');" />  
        <input style="height:40;" type=button value="Remove Video2 TAG" onclick="remove_video_tag('video_container2');" /> <br>
        <input style="height:40;" type=button value="Create Hidden Video TAG" onclick="create_video_tag('hidden_video');" /> <br>
        <select id="video-url">
        </select>
        <br>
        <span>Object-fit property</span>
        <select id="object-fit">
            <option value="fill">fill</option>
            <option value="contain" selected>contain</option>
            <option value="none" >none</option>
        </select>
        <span>css display</span>
          <select id="css-display">
              <option value="none">none</option>
              <option value="inline" selected>inline</option>
              <option value="block">block</option>
          </select>
        <span>css visibility</span>
          <select id="css-visibility">
              <option value="visible" selected>visible</option>
              <option value="hidden">hidden</option>
              <option value="inherit">inherit</option>
          </select>
        <span> Playback Speed(UMS only) : </span>
         <select id='speed' onchange='document.getElementsByTagName("video")[0].playbackRate=$("#speed")[0].value;'>
            <option value='0.25'>0.25</option>
            <option value='0.5'/>0.5</option>
            <option value='0.75'/>0.75</option>
            <option value='1.0' selected />1.0</option>
            <option value='1.25'/>1.25</option>
            <option value='1.5'/>1.5</option>
            <option value='2.0'/>2.0</option>
          </select>
        <span> Volume : </span>
         <select id='volume' onchange='document.getElementsByTagName("video")[0].volume=$("#volume")[0].value;'>
            <option value='0.1'>0.1</option>
            <option value='0.3'/>0.3</option>
            <option value='0.5'/>0.5</option>
            <option value='0.7' selected />0.7</option>
            <option value='0.8'/>0.8</option>
            <option value='0.9'/>0.9</option>
            <option value='1.0'/>1.0</option>
          </select>
        <span> Preload : </span>
         <select id='preload'>
            <option value='auto'>auto</option>
            <option value='metadata'>metadata</option>
            <option value='none'>none</option>
          </select>
        <div id="apply-css">
        </div>
      </div>

      <input style="height:40;" type=button value="AddSpaceH" onclick="add_space('h');" />
      <input style="height:40;" type=button value="AddSpaceV" onclick="add_space('v');" />
      <input style="height:40;" type=button value="Pause" onclick='document.getElementsByTagName("video")[0].pause();' />
      <input style="height:40;" type=button value="Reload" onclick="location.reload();" />
      <input style="height:40;" type=button value="Loop" onclick="loop('video_container');" />
      <div id="set_loop"></div>
      <br>
  </div>
  <div id="top"></div>
  <div id="video_container" ></div>
  <div id="set_loop"></div>
  <div id="video_container2" style="position:relative; left:850px; top:-440px;" > </div>
  <!--<div id="video_container2"> </div>-->
  <div id="bottom"></div>
</div>
</body>
</html>
