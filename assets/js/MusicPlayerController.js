class MusicPlayerController {
    model;
    // bd;

    constructor(model) {
    this.model = model;

    }


    playTrack(track){
        this.model.playTrack(track);
        IndexDB.updateMusicPlayerState(this.model.BD.result, this.model.playlist.id, this.model.currentTrack.id,this.model.prevTrack.id,this.model.nextTrack.id);
    }

    playNextTrack(){
        this.model.playNextTrack();
        IndexDB.updateMusicPlayerState(this.model.BD.result, this.model.playlist.id, this.model.currentTrack.id,this.model.prevTrack.id,this.model.nextTrack.id);
    }

    playPrevTrack(){
        this.model.playPrevTrack();
        IndexDB.updateMusicPlayerState(this.model.BD.result, this.model.playlist.id, this.model.currentTrack.id,this.model.prevTrack.id,this.model.nextTrack.id);
    }

    addTrackToPlaylist(track){
        this.model.playlist.addTrack(track);
        IndexDB.addTrackToPlaylist(this.model.BD.result, track, this.model.playlist.id);
    }


}