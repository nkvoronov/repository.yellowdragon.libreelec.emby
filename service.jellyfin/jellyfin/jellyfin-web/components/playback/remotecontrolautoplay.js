define(["events","playbackManager"],(function(_events,_playbackManager){"use strict";function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}_events=_interopRequireDefault(_events),_playbackManager=_interopRequireDefault(_playbackManager),_events.default.on(_playbackManager.default,"playerchange",(function(e,newPlayer,newTarget,oldPlayer){oldPlayer&&newPlayer&&(oldPlayer.isLocalPlayer?newPlayer.isLocalPlayer?console.debug("Skipping remote control autoplay because newPlayer is a local player"):function transferPlayback(oldPlayer,newPlayer){var state=_playbackManager.default.getPlayerState(oldPlayer),item=state.NowPlayingItem;item&&_playbackManager.default.getPlaylist(oldPlayer).then((function(playlist){var playlistIds=playlist.map((function(x){return x.Id})),resumePositionTicks=(state.PlayState||{}).PositionTicks||0,playlistIndex=playlistIds.indexOf(item.Id)||0;_playbackManager.default.stop(oldPlayer).then((function(){_playbackManager.default.play({ids:playlistIds,serverId:item.ServerId,startPositionTicks:resumePositionTicks,startIndex:playlistIndex},newPlayer)}))}))}(oldPlayer,newPlayer):console.debug("Skipping remote control autoplay because oldPlayer is not a local player"))}))}));