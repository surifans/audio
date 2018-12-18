
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

                var pub = 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0';
                var sub = 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a';

                WebSocket  = PUBNUB.ws;
                var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + channel);	
				
                websocket.push = websocket.send;
                websocket.send = function(data) {
                    websocket.push(JSON.stringify(data));
                };

                var peer = new PeerConnection(websocket,channel);
				//window.onbeforeunload();
			   
			   
                getUserMedia(function(stream) { //打开并创建本地audio
					peer.addStream(stream);
					peer.startBroadcasting();//开始播放
				});
                function getUserMedia(callback) 
				{
                    var hints = {
                        audio: true,
						video: {
                            optional: [],
                            mandatory: {}
                        }
                    };
                    navigator.getUserMedia(hints, function(stream) 
					{
						callback(stream);
                        var video = document.createElement('audio');
                        video.src = URL.createObjectURL(stream);
                        video.controls = true;
                        video.muted = true;
						video.id = 'self';
						video.play();
						video.autoplay = true;
						//alert(111);
						if (document.getElementById(video.id)) 
						{
							
						}else{
							local.appendChild(video);
						}
						
						/*var video = document.getElementById(video.id);
						if (video) 
						{
							video.parentNode.removeChild(video);
						}	
						local.appendChild(video);*/
						
                    });
                }
				
				
                peer.onStreamAdded = function(e) //这里是创建远端连接 
				{
                    
                    var audio = e.mediaElement;
					
					if (document.getElementById(audio.id)) 
					{
						//alert(222);
						//peer.onStreamEnded(e);
						//video.parentNode.removeChild(video);
						
						var video = document.getElementById(video.id);
						if (video) video.parentNode.removeChild(video);
					}
					
					remot.appendChild(audio);
					
                };

                

                
            </script>

            
    </body>
</html>
