class MusicPlayerView {
    inputCanvas;
    inputAudio;
    inputPlaylist;

    btn_play;
    btn_prev;
    btn_next;
    btn_addTrack;

    canvas;
    ctx;
    widthVisualizer;
    heightVisualizer;

    controller;
    model;

    plays_track;

    constructor(model, controller) {
        this.model = model;
        this.controller = controller;
        // this.controller.setView(this);

        this.createInterfacePlayer();
        this.inputAudio = document.getElementById('audio');
        this.inputCanvas = document.getElementById('canvas');
        this.inputPlaylist = document.getElementById('playlist');
        this.btn_play = document.getElementById('play');
        this.btn_prev = document.getElementById('prev');
        this.btn_next = document.getElementById('next');
        this.btn_addTrack = document.getElementById('addTrack');
        //

        this.widthVisualizer = this.inputCanvas.parentNode.offsetWidth;
        Visualizer.SIZE.WIDTH = this.widthVisualizer;
        this.heightVisualizer = Visualizer.SIZE.HEIGHT;
        //
        this.createAudio();
        this.createVisualizer();
        // setInterval(this.drawData.bind(this), 12);
        // this.drawData();
        this.dispatch();
    }

    dispatch() {
        this.model.analyse.audio.onloadeddata = () => {
            this.markTrackPlayToPlaylist();
        };
        //Добавление трека в плейлист
        this.btn_addTrack.addEventListener("change", function (file) {
            let reader = new FileReader();
            reader.onloadend = (e) => {
                var track = document.createElement('button');
                track.className = "list-group-item list-group-item-action";
                track.type = "button";
                track.id = "track_" + this.model.playlist.tracks.length;
                track.textContent = file.files[0].name;

                var song = new Track(this.model.playlist.tracks.length, file.files[0].name, reader.result);
                track.onclick = () => {
                    this.controller.playTrack(song);
                };
                this.inputPlaylist.appendChild(track);
                // this.view.audio.load();
                this.controller.addTrackToPlaylist(song);
            }
            reader.readAsDataURL(file.files[0]);

        }.bind(this, this.btn_addTrack));

        //Воспроизведение
        this.btn_play.onclick = () => {
            var audio = this.model.analyse.audio;
            if (audio.paused) {
                this.btn_play.firstChild.className = "fa fa-pause";
                audio.play();
            } else {
                this.btn_play.firstChild.className = "fa fa-play";
                audio.pause();
            }

        };

        this.btn_prev.onclick = () => {
            this.controller.playPrevTrack();
        };
        this.btn_next.onclick = () => {
            this.controller.playNextTrack();
        };

        this.model.analyse.audio.onended = () => {
            this.controller.playNextTrack();
        };
    }


    drawData() {
        for (var track of this.model.playlist.tracks) {
            this.drawTrack(track);
        }
        this.model.pauseTrack(this.model.currentTrack);
    }

    drawTrack(track) {
        if (track){
            var btn = document.createElement('button');
            btn.className = "list-group-item list-group-item-action";
            btn.type = "button";
            btn.id = "track_" + track.id;
            btn.textContent = track.name;
            btn.onclick = () => {
                this.controller.playTrack(track);
            };
            this.inputPlaylist.appendChild(btn);
        }

    }

    createInterfacePlayer() {
        var frame = document.createElement('div');
        frame.setAttribute('class', 'card text-white border border-secondary bg-dark col-12 col-sm-12 col-md-12 col-lg-3');

        var header = document.createElement('div');
        header.setAttribute('class', 'card-header text-center fw-bold fs-6 m-3');
        header.id = "header";

        var body = document.createElement('div');
        body.setAttribute('class', 'card-body border p-0 bg-light border-secondary');
        body.setAttribute('style', 'height:' + Visualizer.SIZE.HEIGHT + "px");

        //Body <

        var carousel = document.createElement('div');
        carousel.id = "carouselExampleControls";
        carousel.className = "carousel slide";
        carousel.setAttribute("data-bs-interval", 'false');
        carousel.setAttribute('data-bs-ride', 'carousel');

        var carousel_inner = document.createElement('div');
        carousel_inner.className = 'carousel-inner';

        var carousel_item = document.createElement('div');
        carousel_item.className = "carousel-item active";
        carousel_item.id = "canvas";

        var carousel_item_playlist = document.createElement('div');
        carousel_item_playlist.className = "carousel-item";

        var btn_addTrack = document.createElement('div');
        btn_addTrack.className = "input-group  input-group-sm ms-3";
        btn_addTrack.setAttribute('style', 'height: 30px');
        var label = document.createElement('label');
        label.className = "input-group-text";
        label.setAttribute('for', 'addTrack');
        label.textContent = "+";

        var add_Track = document.createElement('input');
        add_Track.type = "file";
        add_Track.className = "form-control";
        add_Track.id = "addTrack";
        add_Track.style = "visibility: hidden";
        add_Track.multiple = true;

        var playlist = document.createElement('div');
        playlist.className = "list-group overflow-auto";
        var height = Number(Visualizer.SIZE.HEIGHT - parseInt(btn_addTrack.style.height, 10));
        playlist.setAttribute('style', "min-height: " + height + "px; max-height: " + height + "px; overflow:scroll");
        playlist.id = "playlist";

        var btn_prev = document.createElement('button');
        btn_prev.className = "carousel-control-prev";
        btn_prev.type = "button";
        btn_prev.setAttribute('data-bs-target', '#carouselExampleControls');
        btn_prev.setAttribute('data-bs-slide', 'prev');
        btn_prev.style = "width: 15px";
        var spn_p1 = document.createElement('span');
        spn_p1.className = "carousel-control-prev-icon";
        spn_p1.setAttribute('aria-hidden', 'true');
        var spn_p2 = document.createElement('span');
        spn_p2.className = "visually-hidden";

        var btn_next = document.createElement('button');
        btn_next.className = "carousel-control-next";
        btn_next.type = "button";
        btn_next.setAttribute('data-bs-target', '#carouselExampleControls');
        btn_next.setAttribute('data-bs-slide', 'next');
        btn_next.style = "width: 15px";
        var spn_n1 = document.createElement('span');
        spn_n1.className = "carousel-control-next-icon";
        spn_n1.setAttribute('aria-hidden', 'true');
        var spn_n2 = document.createElement('span');
        spn_n2.className = "visually-hidden";


        var footer = document.createElement('div');
        footer.setAttribute('class', 'card-footer border border-secondary');
        var audio = document.createElement('div');
        audio.id = "audio";
        audio.setAttribute('allow', "autoplay");

        var btn_music = document.createElement('div');
        btn_music.className = "d-flex justify-content-center p-2";
        var btn_music_prev = document.createElement('button');
        btn_music_prev.id = "prev";
        btn_music_prev.type = 'button';
        btn_music_prev.className = "btn btn-outline-secondary rounded-pill btn-lg";
        var ico_music_prev = document.createElement('i');
        ico_music_prev.className = "fa fa-fast-backward";
        var btn_music_play = document.createElement('button');
        btn_music_play.id = "play";
        btn_music_play.type = 'button';
        btn_music_play.className = "btn btn-outline-secondary rounded-pill btn-lg";
        var ico_music_play = document.createElement('i');
        ico_music_play.className = "fa fa-play";
        var btn_music_next = document.createElement('button');
        btn_music_next.id = "next";
        btn_music_next.type = 'button';
        btn_music_next.className = "btn btn-outline-secondary rounded-pill btn-lg";
        var ico_music_next = document.createElement('i');
        ico_music_next.className = "fa fa-fast-forward";


        header.textContent = "Music";
        document.body.appendChild(frame);
        frame.appendChild(header);
        frame.appendChild(body);
        body.appendChild(carousel);
        carousel.appendChild(carousel_inner);
        carousel_inner.appendChild(carousel_item);
        carousel_inner.appendChild(carousel_item_playlist);
        carousel_item_playlist.appendChild(btn_addTrack);
        btn_addTrack.appendChild(label);
        btn_addTrack.appendChild(add_Track);
        carousel_item_playlist.appendChild(playlist);
        carousel.appendChild(btn_prev);
        btn_prev.appendChild(spn_p1);
        btn_prev.appendChild(spn_p2);
        carousel.appendChild(btn_next);
        btn_next.appendChild(spn_n1);
        btn_next.appendChild(spn_n2);
        frame.appendChild(footer);
        footer.appendChild(audio);
        footer.appendChild(btn_music);
        btn_music.appendChild(btn_music_prev);
        btn_music_prev.appendChild(ico_music_prev);
        btn_music.appendChild(btn_music_play);
        btn_music_play.appendChild(ico_music_play);
        btn_music.appendChild(btn_music_next);
        btn_music_next.appendChild(ico_music_next);
    }

    //Создание визуализатора
    createVisualizer() {
        this.createCanvas();
        this.drawVisualizer();
    }

    drawVisualizer() {
        setInterval(function () {
            this.canvas.width = this.inputCanvas.parentNode.offsetWidth;
            Visualizer.SIZE.WIDTH = this.inputCanvas.parentNode.offsetWidth;

            var ln = Visualizer.MAX_PARTICLES;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i = 0; i < ln; i++) {
                var loc = this.model.visualizer.particles[i];
                this.drawParticles(loc);
            }

            this.drawRope(this.model.visualizer.rope);

            for (var i = 0; i < Visualizer.MAX_BIRDS; i++) {
                var loc = this.model.visualizer.birds[i];
                this.drawBird(loc);
                loc.move();
            }

            if (this.model.state == "success"){
                this.drawData();
                this.model.state = "done";
            }

        }.bind(this), 12);
    }

    //Отображение частицы на экране
    drawParticles(particle) {
        var that = particle;
        var pulsar, scale;
        pulsar = Math.exp(that.pulse);
        scale = pulsar * that.radius || that.radius;
        var ctx = this.ctx;

        ctx.save();
        ctx.beginPath(); //Начинает отрисовку фигуры
        ctx.arc(that.x, that.y, scale, 0, Math.PI * 2);
        ctx.fillStyle = that.color; //цвет
        ctx.globalAlpha = that.opacity / that.level; //прозрачность
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = that.color; //цвет рамки
        ctx.stroke();
        ctx.restore();

        //Движение частицы
        that.move();
    }

    drawBird(bird) {
        var pulse = Math.exp(bird.pulse) || 1;
        var ctx = this.ctx;

        ctx.save();
        ctx.beginPath();

        if (bird.direction === "right" && bird.stop) {
            ctx.scale(-1, 1);
            ctx.drawImage(bird.img, -bird.x, bird.y, bird.img.width * pulse, bird.img.height * pulse);
        } else {
            ctx.drawImage(bird.img, bird.x, bird.y, bird.img.width * pulse, bird.img.height * pulse);
        }
        ctx.closePath();
        ctx.restore();
    }

    drawRope(rope) {
        var ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(rope.x, rope.y);
        ctx.quadraticCurveTo(this.widthVisualizer / 2, rope.y + rope.deflection, this.widthVisualizer, rope.y);
        ctx.strokeStyle = rope.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    //Создание холста
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        //Делаем наш холст на всю страницу
        this.canvas.width = this.widthVisualizer;
        this.canvas.height = this.heightVisualizer;
        //Добавляем его на страницу
        this.inputCanvas.appendChild(this.canvas);
    }

    createAudio() {
        var audio = this.model.analyse.audio;

        audio.setAttribute('style', 'width: 100%');
        // audio.setAttribute('allow', 'autoplay');
        this.inputAudio.appendChild(audio);
        this.model.analyse.update = function (bands) {
            var ln = Visualizer.MAX_PARTICLES;
            var bLn = Visualizer.MAX_BIRDS;

            while (ln--) {
                var loc = this.model.visualizer.particles[ln];
                loc.pulse = bands[loc.band] / 256;
            }

            for (var i = 0; i < bLn; i++) {
                var bird = this.model.visualizer.birds[i];
                bird.pulse = bands[bird.band] / 256;
            }

        }.bind(this);
    }

    markTrackPlayToPlaylist() {
        if (this.plays_track)
            this.plays_track.className = "list-group-item list-group-item-action";

        var id = this.model.currentTrack.id;
        var btn = document.getElementById("track_" + id);
        if (btn){
            btn.className = "list-group-item active";
            this.plays_track = btn;
        }
    }

}