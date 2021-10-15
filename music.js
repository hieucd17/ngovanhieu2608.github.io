// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $(".progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");
const app = {
  currentIndex: 1,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: {},
  songs: [
    {
      name: "Mùa mưa ngâu nằm cạnh",
      singer: "Vũ.",
      path:
        "./music/music3.mp3",
      image: "./img/music3.jpg"
    },
    {
      name: "Khổ thân",
      singer: "Đạt G",
      path: "./music/music4.mp3",
      image:
        "./img/music4.jpg"
    },
    {
      name: "Chờ anh nhé",
      singer: "Hoàng Dũng",
      path: "./music/music1.mp3",
      image: "./img/music1.jpg"
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    // localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
      <div class="song  ${index === this.currentIndex ? "active" : ""} "data-index="${index}">
          <div class="thumb"
              style="background-image: url('${song.image}')">
          </div>
          <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
          </div>
          <div class="option">
              <i class="fas fa-ellipsis-h"></i>
          </div>
      </div>
      `;
    })
    playList.innerHTML = htmls.join('');
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },

  handleEvents: function() {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    
    // Xử lý CD quay và dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 25000, // 10 seconds
      iterations: Infinity
    });
    cdThumbAnimate.pause();

    //Xử lý phóng to thu nhỏ
    document.onscroll = function() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop; 
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    }

    // Khi click vào clicks
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

     // Khi bài hát play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi bài hát bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    let checkOnmouse = true;
    progress.onmousedown = function () {
      checkOnmouse = false;
    }
    progress.ontouchstart = function() {
      checkOnmouse = false;
    }

    // Tiến trình của bài hát.
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    //xử lý khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
      checkOnmouse = true;
    };

    //Khi next bài hát (render lại)
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      // else if (_this.isRepeat) {
      //   // audio.play();
      //   // _this.render()
      // }
      else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi trở về bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Random bài hát khi click
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    /// repeat Bài hát khi click
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //Khi kết thúc bài hát
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        // Tự nhấn nút next cho
        nextBtn.click();
      }
    };

    // Khi click vào classList
    //e là cái envent còn target là cái đích mà bạn click vào.
    playList.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option') )
      {
        // Xử lý khi click vào song 
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);//chuyển từ chuỗii 
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // Xử lý khi click vào option
        if(e.target.closest('.option')) {
          console.log(e.target)

        }
      }
    }
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }, 300)
  },
  // Hàm next bài hát
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  //Hàm trở về bài hát
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  // Hàm random bài hát
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  //Hàm khi bắt đầu load trang hiển thị đầu tiên
  loadCurrentSong: function() {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  start: function() {
    // Lắng nghe và xử lý các sự kiện
    this.handleEvents()

    //Định nghĩa các thuộc tính cho object
    this.defineProperties()

    //Hiển thị đầu tiên khi load trang
    this.loadCurrentSong();

    //Render playlist
    this.render()
  }
};


app.start()