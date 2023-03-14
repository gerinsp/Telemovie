const socket = io();
      const messageList = document.getElementById('messageList');
      const sendMessage = document.getElementById('sendMessage');
      const message = document.getElementById('message');
      const video = document.getElementById("video");
      const header= document.getElementById('header');
      const typing = document.getElementById('typing');
      const userList = document.getElementById('userList');
      let isPlaying = false;
      let typingTimer;

      const name = prompt("Silahkan masukan nama anda.", "");

      message.addEventListener('input', () => {
        clearTimeout(typingTimer);
        socket.emit('typing', name);
        typingTimer = setTimeout(() => {
          socket.emit('stop typing')
        }, 2000);
      });

      socket.on('typing', (message) => {
        const text = `<em><small>${message}</small></em>`;
        typing.innerHTML = text;
      });

      socket.on('stop typing', () => {
        const text = '';
        typing.innerHTML = text;
      });

      video.addEventListener('play', () => {
        isPlaying = true;
        socket.emit('play');
      });

      video.addEventListener('pause', () => {
        isPlaying = false;
        socket.emit('pause');
      });

      video.addEventListener('timeupdate', () => {

        if(isPlaying) {
          socket.emit('timeupdate', video.currentTime);
        }
      });

      window.addEventListener('load', () => {
        socket.emit("join", name);

        socket.on("join", (names) => {
          console.log('join')
          const name = document.createElement('p');
          name.style.textAlign = "center";
          name.innerHTML = `<p><i><small>${names} bergabung kedalam room.</small></i></p>`;
          messageList.appendChild(name);
        });

        socket.on('user-disconnect', (names, id) => {
          const disconnectedId = id;
          const disconnectedElement = document.getElementById(disconnectedId);
          const name = document.createElement('p');
          name.style.textAlign = "center";
          name.innerHTML = `<p><i><small>${names} keluar dari room.</small></i></p>`;
          messageList.appendChild(name);
          if(disconnectedElement) {
            disconnectedElement.remove();
          }
        });

        socket.on('userList', (data) => {
          console.log(data)
          userList.innerHTML = ''; // clear the previous HTML content
         for( let [id, value] of Object.entries(data)) {
            userList.insertAdjacentHTML('beforeend', `
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
            `);
          };
        });

        socket.on('play', () => {
          console.log('videonya di play')
          video.play();
        });

        socket.on('pause', () => {
          console.log('videonya di pause')
          video.pause();
        });

        socket.on('timeupdate', (time) => {
          video.addEventListener('play', () => {
            video.currentTime = time;
          });

          video.addEventListener('pause', () => {
            video.currentTime = 0;
          });
        });
      });

      sendMessage.addEventListener("click", (e) => {
          e.preventDefault();
          if(message.value) {
            const data = {
              name: name,
              message: message.value
            }
            socket.emit("message", data);
              let chatList = document.createElement('p');
              chatList.style.textAlign = "right";
              chatList.textContent = message.value;
              messageList.appendChild(chatList);
              message.value = '';
          }
          messageList.scrollTop = messageList.scrollHeight;
      })

      socket.on("message", (name, message) => {
        let broadcast = document.createElement('p');
        broadcast.style.textAlign = "left";
        broadcast.textContent = name + " : " + message;
        messageList.appendChild(broadcast)
        messageList.scrollTop = messageList.scrollHeight;
      })

      