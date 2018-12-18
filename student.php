
<!DOCTYPE html>
<html lang="en">
    <head>
		
        <script src="PeerConnection1.js"> </script>
        <script src="https://cdn.webrtc-experiment.com/view/websocket.js"> </script>
    </head>

    <body>
			
			<div id="local_media_stream">
			</div>
			<div id="remote_media_stream">
			</div>
			<button onclick="start();" style="width:10vh;height:3vh">通话</button>
			
            <script>
				var remot = document.getElementById('remote_media_stream');//返回指定ID元素
				var local = document.getElementById('local_media_stream');
                var channel ='66';//这里应该设为老师的id，否则不能接通
				var userid = '11_';
                var peer = new PeerConnection(channel,userid,local,remot);//在老师的远端建立的userid为11
				
				
				//alert(peer);
                peer.onUserFound = function(message_userid) 
				{
					if (document.getElementById(channel)) return;
					
					peer.getUserMedia(function(stream) {
						peer.addStream(stream);
						peer.sendParticipationRequest();
					});
				};
				
            </script>

            
    </body>
</html>
