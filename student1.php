
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
			
            <script>
				var remot = document.getElementById('remote_media_stream');//返回指定ID元素
				var local = document.getElementById('local_media_stream');
				
				
                var channel ='66';//这里应该设为老师的id，否则不能接通
                var pub = 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0';
                var sub = 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a';

                WebSocket  = PUBNUB.ws;
                var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + channel);
                websocket.push = websocket.send;
                websocket.send = function(data) {
                    websocket.push(JSON.stringify(data));
                };
				//alert(111);
				
                var peer = new PeerConnection(websocket,"s_22");//在老师的远端建立的userid为11
				window.onbeforeunload();
				//peer.participant=channel;
				
				
				//alert(peer);
                peer.onUserFound = function(userid) 
				{
					if(userid==channel)
					{
						if (document.getElementById(userid)) return;
						
						getUserMedia(function(stream) {
							peer.addStream(stream);
							peer.sendParticipationRequest(userid);
						});
						
					}
                    
                };
				
				
				//alert(111);
                peer.onStreamAdded = function(e) 
				{
                   
                    var audio = e.mediaElement;
					//alert(audio.id);
					if(audio.id==channel)
					{
						if (document.getElementById(audio.id)) 
						{
							var video = document.getElementById(video.id);
							if (video) video.parentNode.removeChild(video);
						}
						remot.appendChild(audio);
					 
					}
                    
                };

                
				
                
                function getUserMedia(callback) 
				{
                    var hints = {
                        audio: true,
                        video: {
                            optional: [],
                            mandatory: {}
                        }
                    };
                    navigator.getUserMedia(hints, function(stream) {
						callback(stream);
                        var video = document.createElement('audio');
                        video.src = URL.createObjectURL(stream);
                        video.controls = true;
                        video.muted = true;
						video.id = 'self';
						video.play();
						video.autoplay = true;
						
						if (document.getElementById(video.id)) 
						{
							
						}else{
							local.appendChild(video);
						}
						
                    });
                }

                
            </script>

            
    </body>
</html>
