class IndexDB {


    constructor() {
        this.dbReq = indexedDB.open('MusicPLayerDB', 5);

        // this.dbReq.onupgradeneeded = (event) => {
        //     this.db = event.target.result;
        //     // Создадим хранилище объектов notes или получим его, если оно уже существует.
        //     var musicPlayer;
        //     var playlist;
        //     var track;
        //
        //     //Созданиие таблицы Playlist
        //     if (!this.db.objectStoreNames.contains('playlist')) {
        //         playlist = this.db.createObjectStore('playlist', {keyPath: 'id'});
        //     } else {
        //         playlist = this.dbReq.transaction.objectStore('playlist');
        //     }
        //
        //     //Созданиие таблицы Track
        //     if (!this.db.objectStoreNames.contains('track')) {
        //         track = this.db.createObjectStore('track', {keyPath: 'id'});
        //     } else {
        //         track = this.dbReq.transaction.objectStore('track');
        //     }
        //
        //     //Созданиие таблицы MusicPlayer
        //     if (!this.db.objectStoreNames.contains('music_player')) {
        //         musicPlayer = this.db.createObjectStore('music_player', {keyPath: 'id'});
        //     } else {
        //         musicPlayer = this.dbReq.transaction.objectStore('music_player');
        //     }
        //
        //     // Если в notes еще нет индекса timestamp создадим его
        //     if (!track.indexNames.contains('playlistId')) {
        //         track.createIndex('playlistId', 'playlist');
        //     }
        //
        // }
        // this.dbReq.onsuccess = (event) => {
        //     this.db = event.target.result;
        //     // getAndDisplayNotes(db);
        //     // addStickyNote(db, 'Hello world first time!');
        //     // addStickyNote(db, 'Hello world second time!');
        //     // addStickyNote(db, 'Hello world third time!');
        // }
        // this.dbReq.onerror = (event) => {
        //     alert('error opening database ' + event.target.errorCode);
        // }

    }

    static createTable(dbReq) {
        var db = dbReq.result;
        // Создадим хранилище объектов notes или получим его, если оно уже существует.
        var musicPlayer;
        var playlist;
        var track;

        //Созданиие таблицы Playlist
        if (!db.objectStoreNames.contains('playlist')) {
            playlist = db.createObjectStore('playlist');
        } else {
            playlist = dbReq.transaction.objectStore('playlist');
        }

        //Созданиие таблицы Track
        if (!db.objectStoreNames.contains('track')) {
            track = db.createObjectStore('track');
        } else {
            track = dbReq.transaction.objectStore('track');
        }

        //Созданиие таблицы MusicPlayer
        if (!db.objectStoreNames.contains('music_player')) {
            musicPlayer = db.createObjectStore('music_player');
        } else {
            musicPlayer = dbReq.transaction.objectStore('music_player');
        }

        // Если в notes еще нет индекса timestamp создадим его
        if (!track.indexNames.contains('playlistId')) {
            track.createIndex('playlistId', 'playlist');
        }
        // Если в notes еще нет индекса timestamp создадим его
        if (!track.indexNames.contains('id')) {
            track.createIndex('id', 'id');
        }

        // Если в notes еще нет индекса timestamp создадим его
        if (!playlist.indexNames.contains('id')) {
            playlist.createIndex('id', 'id');
        }
        // Если в notes еще нет индекса timestamp создадим его
        if (!musicPlayer.indexNames.contains('id')) {
            musicPlayer.createIndex('id', 'id');
        }

    }

    static updateMusicPlayerState(db, playlistId, currentTrackId, prevTrackId, nextTrackId) {
        // Запустим транзакцию базы данных и получите хранилище объектов Notes
        var tx = db.transaction(['music_player'], 'readwrite');
        var store = tx.objectStore('music_player');

        var Player = {
            id: 0,
            playlist: playlistId,
            currentTrack: currentTrackId,
            prevTrack: prevTrackId,
            nextTrack: nextTrackId
        }
        store.put(Player, 0);

        tx.oncomplete = () => {
            // getAndDisplayNotes(db);
            console.log('update player data');
        }
        tx.onerror = (event) => {
            alert('error' + event.target.errorCode);
        }
    }

    static addMusicPlayer(db, playlistId, analyse, visualizer, currentTrackId, prevTrackId, nextTrackID) {
        // Запустим транзакцию базы данных и получите хранилище объектов Notes
        var tx = db.transaction(['music_player'], 'readwrite');
        var store = tx.objectStore('music_player');

        var Player = {
            playlist: playlistId,
            analyse: analyse,
            visualizer: visualizer,
            currentTrack: currentTrackId,
            prevTrack: prevTrackId,
            nextTrack: nextTrackID
        };

        store.put(Player);

        tx.oncomplete = () => {
            // getAndDisplayNotes(db);
            console.log('add player data');
        }
        tx.onerror = (event) => {
            alert('error storing note ' + event.target.errorCode);
        }
    }

    static addTrackToPlaylist(db, track, playlistId) {
        // Запустим транзакцию базы данных и получите хранилище объектов Notes
        var tx = db.transaction(['track'], 'readwrite');
        var store = tx.objectStore('track');

        var Track = {
            id: track.id,
            name: track.name,
            href: track.href,
            playlist: playlistId,
        };

        store.put(Track, track.id);

        tx.oncomplete = () => {
            // getAndDisplayNotes(db);
            console.log('add track');
        }
        tx.onerror = (event) => {
            alert('error add track' + event.target.errorCode);
        }
    }

    static addPlaylist(db, playlist) {
        // Запустим транзакцию базы данных и получите хранилище объектов Notes
        var tx = db.transaction(["playlist"], 'readwrite');
        var store = tx.objectStore('playlist');

        var Playlist = {
            id: playlist.id,
            name: playlist.name,
        };

        store.put(Playlist, playlist.id);

        tx.oncomplete = () => {
            console.log('add playlist');
        }
        tx.onerror = (event) => {
            alert('error add playlist' + event.target.errorCode);
        }
    }

    static getElementKey(db, item, key) {
        var tx = db.transaction([item], 'readonly');
        var store = tx.objectStore(item);
        return store.get(key);
    }

    static getElementsIndex(db, item, index) {
        var tx = db.transaction([item], 'readonly');
        var store = tx.objectStore(item);
        var storeIndex = store.index("playlistId");
        return storeIndex.getAll(index);
    }

}