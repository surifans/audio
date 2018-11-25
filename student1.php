
<!DOCTYPE html>
<html lang="en">
    <head>
        
        
        <style>
            audio, video {
                -moz-transition: all 1s ease;
                -ms-transition: all 1s ease;

                -o-transition: all 1s ease;
                -webkit-transition: all 1s ease;
                transition: all 1s ease;
                vertical-align: top;
            }

           
        </style>
        
        <script src="https://cdn.webrtc-experiment.com/websocket/PeerConnection.js"> </script>
        <script src="https://cdn.webrtc-experiment.com/view/websocket.js"> </script>
    </head>

    <body>
		
            <!-- just copy this <section> and next script -->
            <section class="experiment">
                
                <div id="videos_container"></div>
            </section>

            <script>
				
                var channel ='66';

                var pub = 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0';
                var sub = 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a';

                WebSocket  = PUBNUB.ws;

                var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + channel);

                websocket.onerror = function() {
                    
                };

                websocket.onclose = function() {
                    
                };

                websocket.push = websocket.send;
                websocket.send = function(data) {
                    websocket.push(JSON.stringify(data));
                };

                var peer = new PeerConnection(websocket);
                peer.onUserFound = function(userid) 
				{
					//alert(userid);
                    if (document.getElementById(userid)) return;
					
					
					getUserMedia(function(stream) {
						peer.addStream(stream);
						peer.sendParticipationRequest(userid);
					});
					
                };

                peer.onStreamAdded = function(e) {
                    
                    var video = e.mediaElement;
					//alert(video.id);
					
                    video.setAttribute('width', 600);
                    video.setAttribute('controls', true);
                    videosContainer.insertBefore(video, videosContainer.firstChild);
                    video.play();
                    //scaleVideos();
					//alert(111);
                };

                peer.onStreamEnded = function(e) {
                    var video = e.mediaElement;
                    if (video) {
                        video.style.opacity = 0;
                        
                        setTimeout(function() {
                            video.parentNode.removeChild(video);
                            //scaleVideos();
                        }, 1000);
                    }
                };

                
                var videosContainer = document.getElementById('videos_container');
                
				
                
                function getUserMedia(callback) {
                    var hints = {
                        audio: true,
                        video: false
                    };
                    navigator.getUserMedia(hints, function(stream) {
                        var video = document.createElement('video');
                        video.src = URL.createObjectURL(stream);
                        video.controls = true;
                        video.muted = true;

                        peer.onStreamAdded({
                            mediaElement: video,
                            userid: 'self',
                            stream: stream
                        });

                        callback(stream);
                    });
                }

                
            </script>

            
    </body>
</html>
