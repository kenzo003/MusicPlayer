class MusicPlayerModel {
    //Анализатор
    static SMOOTHING = 0.3; // частота опроса с которой анализатор будет требовать данные
    static FURIE = 512; // указывает, сколько данных мы хотим получить в результате частотного анализа сигнала, это кол-во будет равно fftSize/2

    playlist;
    analyse;
    visualizer;

    currentTrack;
    prevTrack;
    nextTrack;
    state; //success //process //done


    constructor() {
        this.state = "ready";
        this.playlist = new Playlist(0, "MyMusic");
        this.analyse = new Analyse(MusicPlayerModel.SMOOTHING, MusicPlayerModel.FURIE);
        this.visualizer = new Visualizer();
        this.currentTrack = new Track(0, "", "");
        this.prevTrack = new Track(0, "", "");
        this.nextTrack = new Track(0, "", "");
        this.baseDateInit();
    }

    baseDateInit() {
        this.BD = indexedDB.open('MusicPLayerDB', 19); //Открытие или создание БД
        this.BD.onupgradeneeded = (event) => {
            var res = event.target.result;
            IndexDB.createTable(this.BD);
        };
        this.BD.onsuccess = (event) => {
            this.init();
        };
    }

    getPlaylistBD(playlistId) {
        var playlist = IndexDB.getElementKey(this.BD.result, 'playlist', playlistId);
        playlist.onsuccess = (event) => {
            var result = event.target.result;
            if (result) {
                this.playlist = new Playlist(result.id, result.name);
                console.log("get playlist" + this);
            } else {
                // IndexDB.addPlaylist(this.BD.result, this.playlist);
            }
        };
    }

    getTracksBD(playlistId) {
        var track = IndexDB.getElementsIndex(this.BD.result, 'track', playlistId);
        track.onsuccess = (event) => {
            var result = event.target.result;
            if (result) {
                // this.playlist = new Playlist(result.id, result.name);
                for (var item of result) {
                    var track = new Track(item.id, item.name, item.href);
                    this.playlist.addTrack(track);
                }
                this.currentTrack = this.playlist.tracks[this.currentTrack.id];
                this.prevTrack = this.playlist.tracks[this.prevTrack.id];
                this.nextTrack = this.playlist.tracks[this.nextTrack.id];
                this.state = "success";
            }
        };
    }

    init() {
        var state_player = IndexDB.getElementKey(this.BD.result, 'music_player', 0);
        {
            state_player.onsuccess = (event) => {
                var result = event.target.result;
                if (result) {
                    this.currentTrack.id = result.currentTrack;
                    this.prevTrack.id = result.prevTrack;
                    this.nextTrack.id = result.nextTrack;

                    this.getPlaylistBD(result.playlist);
                    this.getTracksBD(result.playlist);
                    console.log("init");
                }
            };
        }
    }

    update() {
        var playlist = this.playlist.id;
        var currentTrack = this.currentTrack.id;
        var prevTrack = this.prevTrack.id;
        var nextTrack = this.nextTrack.id;
        IndexDB.updateMusicPlayerState(this.BD.result, playlist, currentTrack, prevTrack, nextTrack);
    }

    playTrack(track) {
        var tracks = this.playlist.tracks;
        var id_current_track = tracks.indexOf(track);

        this.currentTrack = track;
        this.prevTrack = (tracks[id_current_track - 1]) ? tracks[id_current_track - 1] : this.currentTrack;
        this.nextTrack = (tracks[id_current_track + 1]) ? tracks[id_current_track + 1] : this.currentTrack;

        if (this.currentTrack) {
            this.analyse.audio.src = track.href;
            this.analyse.audio.load();
            this.analyse.audio.play();
        }
    }

    pauseTrack(track) {
        var tracks = this.playlist.tracks;
        var id_current_track = tracks.indexOf(track);

        this.currentTrack = track;
        this.prevTrack = (tracks[id_current_track - 1]) ? tracks[id_current_track - 1] : this.currentTrack;
        this.nextTrack = (tracks[id_current_track + 1]) ? tracks[id_current_track + 1] : this.currentTrack;

        if (this.currentTrack) {
            this.analyse.audio.src = track.href;
            this.analyse.audio.load();
            this.analyse.audio.pause();
        }
    }

    playNextTrack() {
        this.playTrack(this.nextTrack);
    }

    playPrevTrack() {
        this.playTrack(this.prevTrack);
    }

}


class Playlist {
    id; //id плейлиста
    name; //название плейлиста
    tracks = []; //треки в плейлисте

    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    addTrack(track) {
        this.tracks.push(track);
    }

    delTrack(track) {
        const id = track.indexOf(track);
        this.tracks.splice(id, 1);
    }

}

class Track {
    id; //id трека
    name; //название трека
    href;//расположение трека

    constructor(id, name, href) {
        this.id = id;
        this.href = href;
        this.name = name;
    }
}

class Analyse {
    AudioContext;
    audio;
    context;
    node;
    analyser;
    bands;

    constructor(SMOOTHING, FURIE) {
        this.AudioContext = window.AudioContext || window.webkitAudioContext;

        //Создание источника
        this.audio = new Audio();
        this.audio.src = "";
        this.audio.controls = true;
        this.audio.allow = true;

        //Создание аудио-контекста
        this.context = new AudioContext();
        // this.context = this.AudioContext.resume;
        // Этот метод позволяет создать интерфейс для сбора, обработки или анализа аудио-данных при помощи js.
        this.node = this.context.createScriptProcessor(2048, 1, 1);

        //Анализатор
        // Данный метод позволяет получить информацию о частотных и временных параметрах сигнала в виде массива данных
        this.analyser = this.context.createAnalyser();
        // частота опроса с которой анализатор будет требовать данные
        this.analyser.smoothingTimeConstant = SMOOTHING;
        // указывает, сколько данных мы хотим получить в результате частотного анализа сигнала, это кол-во будет равно fftSize/2
        this.analyser.fftSize = FURIE;
        // создания массива с четким указанием границ, в нашем случае его длина будет равна 256.
        this.bands = new Uint8Array(this.analyser.frequencyBinCount);
        // console.log(this.bands);

        this.audio.addEventListener("canplay", function () {
            if (!this.source) {
                // Создает интерфейс, который представляет собой источник звука от аудио или видео элемента
                this.source = this.context.createMediaElementSource(this.audio);
                //связываем источник с анализатором
                this.source.connect(this.analyser);
                //связываем анализатор с интерфейсом, из которого он будет получать данные
                this.analyser.connect(this.node);
                //Связываем все с выходом
                // AudioContext.destination — это системный звуковой выход по умолчанию (обычно это колонки).
                this.node.connect(this.context.destination);
                this.source.connect(this.context.destination);

                //подписываемся на событие изменения входных данных
                this.node.onaudioprocess = function () {
                    // Метод getByteFrequencyData — этот метод получает данные от анализатора и копирует их в переданный массив, который мы в итоге и возвращаем, благодаря великой магии замыканий.
                    this.analyser.getByteFrequencyData(this.bands);
                    if (!this.audio.paused) {
                        return typeof this.update === "function" ? this.update(this.bands) : 0;
                    }
                }.bind(this);
            }

        }.bind(this));
    }


}

class Visualizer {
    // Визуализатор
    static MAX_PARTICLES = 20; //Максимальное количсетво частиц
    static MAX_BIRDS = 30; //Максимальное количество птичек
    static RADIUS = {
        MAX: 50.0,
        MIN: 10.0
    };
    static SIZE = {
        WIDTH: 570,
        HEIGHT: 500
    };
    static OPACITY = {
        MIN: 0.4,
        MAX: 0.8
    };
    static SPEED = {
        MIN: 0.2,
        MAX: 0.8
    };
    static BIRD_SPEED = {
        MIN: 3.5,
        MAX: 4.2
    };
    static BIRD_JUMP = {
        MIN: 10,
        MAX: 30
    };
    static IMAGES = ['assets/img/red.png', 'assets/img/ell.png', 'assets/img/blue.png', 'assets/img/black.png', 'assets/img/white.png']; //Изображение птиц
    static COLORS = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423']; //цвета частиц

    particles = []; //Тут будут храниться все созданные частицы
    birds = []; //Массив птичек
    rope;
    static freeSpace = Visualizer.SIZE.WIDTH;


    constructor() {
        this.createParticles();
        this.createBirds();
        this.rope = new Rope();
    }

    createParticles() {
        var particle = null;
        for (var i = 0; i < Visualizer.MAX_PARTICLES; i++) {
            particle = new Particle();
            this.particles.push(particle);
        }
    }

    createBirds() {
        for (var i = 0; i < Visualizer.MAX_BIRDS; i++) {
            this.birds.push(new Bird());
        }
    }

}

//Частица
class Particle {
    x;
    y;
    level;
    speed;
    radius;
    color;
    opacity;
    band;

    constructor() {
        this.x = random(Visualizer.SIZE.WIDTH);
        this.y = random(Visualizer.SIZE.HEIGHT);
        this.level = 1 * random(4);
        this.speed = random(Visualizer.SPEED.MIN, Visualizer.SPEED.MAX);
        this.radius = random(Visualizer.RADIUS.MIN, Visualizer.RADIUS.MAX); //радиус частиц
        this.color = random(Visualizer.COLORS); //цвет частицы
        this.opacity = random(Visualizer.OPACITY.MIN, Visualizer.OPACITY.MAX);
        this.band = Math.floor(random(128));
    }

    // Движение частиц
    move() {
        this.y -= this.speed * this.level;
        //Возврашам в начало частицы которые ушли за пределы хослста
        if (this.y < -100) {
            this.y = Visualizer.SIZE.HEIGHT;
        }
    }
}

//Птичка
class Bird {
    static number = 0;
    img;
    up;
    down;
    stop;
    band;
    direction;
    finish;
    level;
    x;
    y;
    speed;
    jump;

    constructor() {
        var img = new Image();
        img.src = random(Visualizer.IMAGES);
        img.width = 30;
        img.height = 30;
        this.up = true;
        this.down = false;
        this.stop = false;
        this.band = Math.floor(random(128));
        this.direction = random(["right", "left"]);
        this.finish = false;
        this.level = random(0.2, 0.6);
        this.x = Bird.number * img.width * 1.6 + 20;
        this.y = Visualizer.SIZE.HEIGHT / 2 - img.height;
        this.speed = random(Visualizer.BIRD_SPEED.MIN, Visualizer.BIRD_SPEED.MAX);
        this.jump = random(Visualizer.BIRD_JUMP.MIN, Visualizer.BIRD_JUMP.MAX);
        this.img = img;
        Bird.number++;
    }

    move() {
        var pulse = Math.exp(this.pulse) || 1;
        this.y = (Visualizer.SIZE.HEIGHT / 2 - this.img.height * pulse);

    }
}

class Rope {
    constructor() {
        this.x = 0;
        this.y = Visualizer.SIZE.HEIGHT / 2;
        this.deflection = 0.0;
        this.color = "#000";
    }
}