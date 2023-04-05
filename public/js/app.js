const socket = io();
const messageList = document.getElementById("messageList");
const sendMessage = document.getElementById("sendMessage");
const message = document.getElementById("message");
const video = document.getElementById("video");
const header = document.getElementById("header");
const typing = document.getElementById("typing");
const userList = document.getElementById("userList");
const emoji = document.getElementById("emoji");
const emojiPicker = document.querySelector("emoji-picker");
const videoContainer = document.getElementById("video-container");
const startCallButton = document.getElementById('startCallBtn');
const cardVideo = document.querySelector('.card-video');
const btnVideo = document.getElementById('btn-video');
const btnReject = document.getElementById('btn-reject');
const videoCallContainer = document.getElementById('videoCallContainer');
let isPlaying = false;
let typingTimer;
let localStream;
let socketId;
let id1;
let activeCall;

cardVideo.style.display = 'none';

const name = prompt("Silahkan masukan nama anda.", "");

btnVideo.addEventListener('click', () => {
  localStream.getTracks().forEach(track => {
    if(track.enabled) { 
      track.enabled = false;
      btnVideo.innerHTML = '<i class="bi bi-camera-video-off"></i>';
    } else {
      track.enabled = true;
      btnVideo.innerHTML = '<i class="bi bi-camera-video"></i>';
    }
  })
})

btnReject.addEventListener('click', () => {
  if (activeCall) {
    activeCall.close();
    cardVideo.style.display = 'none';
    socket.emit('end-call', name);
    startCallButton.innerHTML = '<i class="bi bi-telephone"></i>';
  }
})

socket.on('end-call', (name) => {
  const p = document.createElement("p");
    p.style.textAlign = "center";
    p.innerHTML = `<p><i><small>${name} mengakhiri panggilan.</small></i></p>`;
    messageList.appendChild(p);
    cardVideo.style.display = 'none';
    startCallButton.innerHTML = '<i class="bi bi-telephone"></i>';
})

// peerjs
var peer = new Peer();

peer.on('open', id => {
  id1 = id
  console.log('id awal' + id1)
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
  localStream = stream;
  const videoElement = document.getElementById('video1');
    videoElement.srcObject = localStream;
    videoElement.onloadedmetadata = () => videoElement.play();
})

socket.on('audio-aktif', (name) => {
  const mic = document.createElement("p");
    mic.style.textAlign = "center";
    mic.innerHTML = `<p><i><small>${name} melakukan panggilan video.</small></i></p>`;
    messageList.appendChild(mic);
})

startCallButton.addEventListener('click', () => {
  cardVideo.style.display = 'block';
  startCallButton.innerText = 'Calling...';
  socket.emit('peerId', id1);
  socket.emit('audio-aktif', name);
  console.log(id1)
})

socket.on('call', (peerId) => {
  console.log(peerId)
  const remotePeerId = peerId;
  const call = peer.call(remotePeerId, localStream);
  activeCall = call;
  call.on('stream', stream => {
    const remoteVideo = document.getElementById('video2');
        remoteVideo.srcObject = stream;
        remoteVideo.onloadedmetadata = () => remoteVideo.play()
  })
});

peer.on('call', call => {
  console.log('answer')
  startCallButton.innerText = 'Calling...';
  call.answer(localStream);
  call.on('stream', stream => {
    const remoteVideo = document.getElementById('video2');
        remoteVideo.srcObject = stream;
        remoteVideo.onloadedmetadata = () => remoteVideo.play()
  })
})

if (window.innerWidth <= 550) {
  messageList.style.height = "400px";
}

message.addEventListener("focus", () => {
  if (window.innerWidth <= 550) {
    messageList.style.height = "120px";
    messageList.scrollTop = messageList.scrollHeight;
  }
});

message.addEventListener("blur", () => {
  if (window.innerWidth <= 550) {
    messageList.style.height = "400px";
    messageList.scrollTop = messageList.scrollHeight;
  }
});

emojiPicker.style.display = "none";
emoji.addEventListener("click", () => {
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
  if (emojiPicker.style.display === "none") {
    if (window.innerWidth <= 550) {
      messageList.style.height = "400px";
    } else {
      messageList.style.height = "500px";
    }
    console.log("none");
  } else if (emojiPicker.style.display === "block") {
    if (window.innerWidth <= 550) {
      messageList.style.height = "120px";
    } else {
      messageList.style.height = "200px";
    }
    console.log("block");
  }
  messageList.scrollTop = messageList.scrollHeight;
});

emojiPicker.addEventListener(
  "emoji-click",
  (event) => (message.value += event.detail.unicode)
);

message.addEventListener("input", () => {
  clearTimeout(typingTimer);
  socket.emit("typing", name);
  typingTimer = setTimeout(() => {
    socket.emit("stop typing");
  }, 2000);
});

socket.on("typing", (message) => {
  const text = `<em><small>${message}</small></em>`;
  typing.innerHTML = text;
});

socket.on("stop typing", () => {
  const text = "";
  typing.innerHTML = text;
});

video.addEventListener("play", () => {
  isPlaying = true;
  socket.emit("play");
});

video.addEventListener("pause", () => {
  isPlaying = false;
  socket.emit("pause");
});

video.addEventListener("timeupdate", () => {
  if (isPlaying) {
    socket.emit("timeupdate", video.currentTime);
  }
});

window.addEventListener("load", () => {
  socket.emit("join", name);

  socket.on("join", (names) => {
    console.log("join");
    const name = document.createElement("p");
    name.style.textAlign = "center";
    name.innerHTML = `<p><i><small>${names} bergabung kedalam room.</small></i></p>`;
    messageList.appendChild(name);
  });

  socket.on("user-disconnect", (names, id) => {
    const disconnectedId = id;
    const disconnectedElement = document.getElementById(disconnectedId);
    const name = document.createElement("p");
    name.style.textAlign = "center";
    name.innerHTML = `<p><i><small>${names} keluar dari room.</small></i></p>`;
    messageList.appendChild(name);
    if (disconnectedElement) {
      disconnectedElement.remove();
    }
  });

  socket.on("userList", (data) => {
    console.log(data);
    userList.innerHTML = ""; // clear the previous HTML content
    for (let [id, value] of Object.entries(data)) {
      userList.insertAdjacentHTML(
        "beforeend",
        `
              <div class="col" id="${id}" style="margin-right: 20px;">
                <div class="card border-0">
                </div>
                <div class="card-body">
                  <div style="text-align: center;">
                    <img class="text-center" width="50px" src="/img/user.png" style="text-align: center;">
                  </div>
                  <p class="text-center">${value}</p>
                </div>
              </div>
            `
      );
    }
  });

  socket.on("play", () => {
    console.log("videonya di play");
    video.play();
  });

  socket.on("pause", () => {
    console.log("videonya di pause");
    video.pause();
  });

  socket.on("timeupdate", (time) => {
    video.addEventListener("play", () => {
      video.currentTime = time;
    });

    video.addEventListener("pause", () => {
      video.currentTime = 0;
    });
  });
});

sendMessage.addEventListener("click", (e) => {
  e.preventDefault();
  if (message.value) {
    const data = {
      name: name,
      message: message.value,
    };
    socket.emit("message", data);
    let chatList = document.createElement("p");
    chatList.style.textAlign = "right";
    chatList.textContent = message.value;
    messageList.appendChild(chatList);
    message.value = "";
  }
  messageList.scrollTop = messageList.scrollHeight;
});

socket.on("message", (name, message) => {
  let broadcast = document.createElement("p");
  broadcast.style.textAlign = "left";
  broadcast.textContent = name + " : " + message;
  messageList.appendChild(broadcast);
  messageList.scrollTop = messageList.scrollHeight;
});

// card

const card = document.querySelector('.card-video');

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

card.addEventListener('mousedown', dragStart);
card.addEventListener('mouseup', dragEnd);
card.addEventListener('mousemove', drag);

function dragStart(e) {
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;

  if (e.target === card) {
    isDragging = true;
  }
}

function dragEnd(e) {
  initialX = currentX;
  initialY = currentY;

  isDragging = false;
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();

    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, card);
  }
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

document.addEventListener("dragstart", function(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
  event.target.style.opacity = "0.4";
});

document.addEventListener("dragend", function(event) {
  event.target.style.opacity = "1";
});

document.addEventListener("dragover", function(event) {
  event.preventDefault();
});

document.addEventListener("drop", function(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);
  const dropzone = event.target;

  if (dropzone.classList.contains("dropzone")) {
    dropzone.appendChild(draggableElement);
  }
});

