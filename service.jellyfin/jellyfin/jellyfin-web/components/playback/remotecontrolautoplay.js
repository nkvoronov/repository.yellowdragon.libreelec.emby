"use strict";define(["events","playbackManager"],(function(events,playbackManager){events.on(playbackManager,"playerchange",(function(e,newPlayer,newTarget,oldPlayer){oldPlayer&&newPlayer&&(oldPlayer.isLocalPlayer?newPlayer.isLocalPlayer?console.debug("Skipping remote control autoplay because newPlayer is a local player"):function transferPlayback(oldPlayer,newPlayer){var state=playbackManager.getPlayerState(oldPlayer),item=state.NowPlayingItem;if(item){var resumePositionTicks=(state.PlayState||{}).PositionTicks||0;playbackManager.stop(oldPlayer).then((function(){playbackManager.play({ids:[item.Id],serverId:item.ServerId,startPositionTicks:resumePositionTicks},newPlayer)}))}}(oldPlayer,newPlayer):console.debug("Skipping remote control autoplay because oldPlayer is not a local player"))}))}));