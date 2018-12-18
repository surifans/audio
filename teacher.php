
<!DOCTYPE html>
<html lang="en">
    <head>
        
        <script src="PeerConnection0.js"> </script>
        <script src="https://cdn.webrtc-experiment.com/view/websocket.js"> </script>
    </head>

    <body>
		
			<div id="local_media_stream">
			</div>
			<div id="remote_media_stream">
			</div>

            <script>
				var remot = document.getElementById('remote_media_stream');//返回指定ID元素
				var local = document.getElementById('local_media_stream');
                var channel ='66';//这里应该设为老师的id，否则不能接通
                var peer = new PeerConnection(channel,channel,local,remot);
				peer.onbeforeunload();
				peer.getUserMedia(function(stream) {
					peer.addStream(stream);
					peer.startBroadcasting();//开始播放
				});
				
            </script>

            
    </body>
</html>
