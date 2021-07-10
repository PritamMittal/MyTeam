const socket = io();
// defining all the variables and getting all the elements from room.ejs
let myVideoStream;
let myScreenShare;
const videoGrid = document.getElementById("video-grid");
const screenGrid = document.getElementById("screen-grid");
const myVideo = document.createElement("video");
const myScreen = document.createElement("screen");
// setting my video as muted to avoid echo
myVideo.muted = true;
// initializing the prompt which asks the user for the name which he or she wants to enter with
const user = prompt("Enter your name");
// defining the new peer
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

// allowing the webcam and microphone to connect with the system
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  // promise
  .then((stream) => {
    // setting myVideoStream as the stream
    myVideoStream = stream;
    myVideoStream.getAudioTracks()[0].enabled = false;
    myVideoStream.getVideoTracks()[0].enabled = false;
    // adding the video to myScreen
    appendVideoToVideo_Grid(myVideo, myVideoStream);
    // answering the call
    peer.on("call", (call) => {
      call.answer(stream);
      // creating the video as new element 
      const video = document.createElement("video");
      // adding the all video to all myScreen
      call.on("stream", (userVideoStream) => {
        appendVideoToVideo_Grid(video, userVideoStream);
      });
    });
    // connect myself to all all the participants
    socket.on("user-connected", (userId, userName) => {
      console.log(userName);
      setTimeout(newUserConnectionVideo, 1000, userId, stream, userName);
    });
  });

// video section comes in on joining the video call
function onEntry() {
  document.getElementById("main-left").style.visibility = "visible";
  document.getElementById("joinButton").style.display = "none";
  document.getElementById("main-left").style.flexGrow = "80";
  document.getElementById("main-right").style.maxWidth = "315px";
  document.getElementById("video-grid").style.display = "flex";
}

// function enables on clicking join video meeting
function callthisOnEntry() {
  document.getElementById("joinButton").addEventListener("click", function () {
    onEntry();
    muteUnmuteAudio();
    muteUnmuteVideo();
  });
}

// adding the message to the message container on pressing enter
let text = $("input");
$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});

// appending the message to message container with username of the otheruser and if send by myself it is appended with "ME"
socket.on("createMessage", (message, userName) => {
  var n = "ME";
  if (userName !== user) {
    n = userName;
  }
  if (n !== null)
    $("ul").append(`<li class="messages"><b><i class="far fa-user-circle"></i>` + "  " + n + `</b><br />${message}</li>`);
  scrollToBottom();
});

// function to enable screen sharing on clicking the button screen share in room.ejs
function screenSharing() {
  navigator.mediaDevices.getDisplayMedia({
      video: true
    })
    .then((stream) => {
      myScreenShare = stream;
      appendScreenToScreen_Grid(myScreen, myScreenShare);
      peer.on("call", (call) => {
        call.answer(stream);
        const screen = document.createElement("screen");
        call.on("stream", (userScreenStream) => {
          appendScreenToScreen_Grid(screen, userScreenStream);
        });
      });
      socket.on("user-connected", (userId) => {
        setTimeout(newUserConnectionScreen, 1000, userId, stream);
      });
    });
}

socket.emit("join-room", ROOM_ID);

// connecting the user to the server
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

// connecting myself to all the participants
const newUserConnectionVideo = (userId, stream, userName) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    appendVideoToVideo_Grid(video, userVideoStream, userName);
  });
};

// connecting myscreen to all the participants 
const newUserConnectionScreen = (userId, stream) => {
  const call = peer.call(userId, stream);
  const screen = document.createElement("screen");
  call.on("stream", (userScreenStream) => {
    appendScreenToScreen_Grid(screen, userScreenStream);
  });
};

// appending the video in video-grid
const appendVideoToVideo_Grid = (video, stream, userName) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.appendChild(video);
  video.controls = true;
  scrollToBottomVideo();
};

// appending the screen in screen-grid
const appendScreenToScreen_Grid = (screen, stream) => {
  screen.srcObject = stream;
  screen.addEventListener("loadedmetadata", () => {
    screen.play();
  });
  screenGrid.appendChild(screen);
};

// scroll function in chat window
const scrollToBottom = () => {
  var d = $(".main__chatWindow");
  d.scrollTop(d.prop("scrollHeight"));
};

// scroll function if video section overflows
const scrollToBottomVideo = () => {
  var d = $("#video-grid");
  d.scrollTop(d.prop("scrollHeight"));
};

// function to mute and unmute audio
const muteUnmuteAudio = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

// setting the innerhtml and icon after muting audio
const setMuteButton = () => {
  const html = '<i class="fas fa-microphone"></i><span>Mute</span>';
  document.querySelector(".Microphone").innerHTML = html;
};

// setting the innerhtml and icon after unmuting audio
const setUnmuteButton = () => {
  const html =
    '<i class="fas fa-microphone-slash unmute"></i><span>Unmute</span>';
  document.querySelector(".Microphone").innerHTML = html;
};

// function to mute and unmute the video 
const muteUnmuteVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setUnmuteVideoButton();
  } else {
    setMuteVideoButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

// setting the innerhtml and icon after muting video
const setMuteVideoButton = () => {
  const html = '<i class="fas fa-video"></i><span>Stop Video</span>';
  document.querySelector(".VideoCamera").innerHTML = html;
};

// setting the innerhtml and icon after unmuting video
const setUnmuteVideoButton = () => {
  const html =
    '<i class="fas fa-video-slash unmute"></i><span>Start Video</span>';
  document.querySelector(".VideoCamera").innerHTML = html;
};

// exit the video call
const exitCall = () => {
  if (confirm("Do you want to leave the meeting?") == true) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    document.getElementById("main-left").style.visibility = "hidden";
    document.getElementById("main-left").style.maxWidth = "0px";
    document.getElementById("main-right").style.maxWidth = "100%";
    document.getElementById("video-grid").style.display = "none";
    document.getElementById("leaveRoomButton").style.display = "block";
  }
}

// leave the room
const leaveTheRoom = () => {
  if (confirm("Do you want to leave the room?") == true) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    location.replace("https://my-team-prof-junior.herokuapp.com/");
    return false;
  } else {
    return;
  }
}

// open MyNotes in new tab
const openNotes = () => {
  setTimeout(function () {
    window.open("https://keeper-47ca2.web.app/", "_blank");
  }, 400);
}

// hide and unhide chat on button click
function hideChat() {
  var x = document.getElementById("main-right");
  var y = document.getElementById("main-left");
  var z = document.querySelector("main__chatWindow");
  if (x.style.display === "none") {
    x.style.display = "block";
    z.style.height = "608px";
    z.style.flexGrow = "1";

  } else {
    x.style.display = "none";
    x.style.width = "5000px";
  }
}

// enabling the invitebutton which pops out with the link of the meeting
const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

// geeting the current time to display it on the user interface
setInterval(function () {
  var dt = new Date();
  document.getElementById("datetime").innerHTML = dt.toLocaleTimeString();
}, 1000);