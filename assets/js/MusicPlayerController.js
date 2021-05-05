class MusicPlayerController {
    model;
    constructor(model) {
    this.model = model;
    }

    playTrack(track){
        this.model.playTrack(track);
    }

    playNextTrack(){
        this.model.playNextTrack();
    }

    playPrevTrack(){
        this.model.playPrevTrack();
    }

    addTrackToPlaylist(track){
        this.model.playlist.addTrack(track);
    }


}