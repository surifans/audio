// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket

(function () {
	
    window.PeerConnection = function (channel, userid,local,remot) {
        this.userid = userid ;
        this.peers = {};
		this.participant = channel;
		
		var pub = 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0';
		var sub = 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a';
		WebSocket  = PUBNUB.ws;
		var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + channel);
		websocket.push = websocket.send;
		websocket.send = function(data) {
			websocket.push(JSON.stringify(data));
		};
		
		
		
		var socket = websocket;
		
        new Signaler(this, socket);
		
		this.addStream = function(stream) {	
			this.MediaStream = stream;
		};
		
		this.getUserMedia = function(callback) 
		{
			
			/*var hints = {
				audio: true,
				video: {
					optional: [],
					mandatory: {}
				}
			};
			
			navigator.getUserMedia(hints, function(stream) 
			{
				var video = document.createElement('audio');
				//video.src = URL.createObjectURL(stream);
				video.srcObject = stream;
				video.controls = true;
				video.muted = true;
				video.id = 'self';
				video.play();
				video.autoplay = true;
				//alert(222);
				
				if (document.getElementById(video.id)) 
				{
					
				}else{
					local.appendChild(video);
				}
				callback(stream);
				
			});*/
			var constraints = {
					audio: true,
					video: false
				};

            navigator.mediaDevices.getUserMedia(constraints).then(onstream).catch(onerror);

            function onstream(stream) 
			{
                //alert(111);
                var video = document.createElement('audio');
                video.id = 'self';
                video.muted = true;
                video.volume = 0;
                
                try {
                        video.setAttributeNode(document.createAttribute('autoplay'));
                        video.setAttributeNode(document.createAttribute('playsinline'));
                        video.setAttributeNode(document.createAttribute('controls'));
                    } catch (e) {
                        video.setAttribute('autoplay', true);
                        video.setAttribute('playsinline', true);
                        video.setAttribute('controls', true);
                    }

                video.srcObject = stream;
				this.MediaStream = stream;
				
                if (document.getElementById(video.id)) 
				{
					
				}else{
					local.appendChild(video);
				}

                callback(stream);
            }

            function onerror(e) {
                console.error(e);
            }
			
			
			//alert(111);
		}
		
		this.onStreamAdded = function(e) 
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
		
		this.sendParticipationRequest = function (userid) 
		{
			//alert(userid);
            socket.send({
                participationRequest: true,
                userid: this.userid,
                to: userid
            });
        };
		
		
		
    };

    function Signaler(root, socket) 
	{
        var self = this;
		//var socket = socketURL;
		socket.onmessage = onmessage;//接受消息
		
        var candidates = [];
		
		function onmessage(e) 
		{
			
			var message = JSON.parse(e.data);

            if (message.userid == root.userid) return;//root.userid为学生id
            //root.participant = message.userid;

            //alert(root.userid);
			//alert(message.sdp);
            
            if (message.sdp && message.to == root.userid) // if someone shared SDP
			{
				//alert(111);
                var sdp = message.sdp;
				
				if (sdp.type == 'offer') 
				{
					
					root.peers[message.userid] = Answer.createAnswer(merge(options, {
						MediaStream: root.MediaStream,
						sdp: sdp
					}));
				}
            }
			
            if (message.candidate && message.to == root.userid) // if someone shared ICE
			{
				//alert(message.sdp);
				//alert(candidates.length);
                var peer = root.peers[message.userid];
				if (peer) 
				{
					peer.addIceCandidate(message.candidate);
					for (var i = 0; i < candidates.length; i++) 
					{
						peer.addIceCandidate(candidates[i]);
					}
					candidates = [];
				} else candidates.push(candidates);
            }

            if (message.broadcasting && root.onUserFound ) 
			{
				//alert(123);
                root.onUserFound(message.userid);
            }
			
			if (message.userLeft) 
			{
                var video = document.getElementById(message.userid);
				if (video) 
				{
					video.parentNode.removeChild(video);
					root.peers[message.userid].peer.close();
					root.peers[message.userid] = {};
				}
				
				
            }
            
		}
		
		
		var options = // it is passed over Offer/Answer objects for reusability
		{
            onsdp: function (sdp) 
			{
                socket.send({
                    userid: root.userid,
                    sdp: sdp,
                    to: root.participant
                });
            },
            onicecandidate: function (candidate) 
			{
                socket.send({
                    userid: root.userid,
                    candidate: candidate,
                    to: root.participant
                });
            },
            onStreamAdded: function (stream) 
			{
                
                var mediaElement = document.createElement('audio');
                mediaElement.id = root.participant;
                mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                mediaElement.autoplay = true;
                mediaElement.controls = true;
                mediaElement.play();

                var streamObject = {
                    mediaElement: mediaElement,
                    stream: stream,
                    userid: root.participant,
                    type: 'remote'
                };

                if (root.onStreamAdded)
				{
					//alert(111);
					root.onStreamAdded(streamObject);
				}
                    
            }
        };
		
		
		function closePeerConnections() 
		{
            //self.stopBroadcasting = true;
            if (root.MediaStream) root.MediaStream.stop();

            for (var userid in root.peers) {
                root.peers[userid].peer.close();
            }
            root.peers = {};
        }

        

        window.onbeforeunload = function () {
			//alert(root.participant);
            socket.send({
                userLeft: true,
                userid: root.userid,  //当前学生id
                to: root.participant	//应该为要对话的老师的id
            });
            //closePeerConnections();
        };
		
		
		
    }

    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;//定义RTCPeerConnection类
    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    var isFirefox = !!navigator.mozGetUserMedia;
    var isChrome = !!navigator.webkitGetUserMedia;

    var STUN = {
        url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };

    var TURN = {
        url: 'turn:homeo@turn.bistri.com:80',
        credential: 'homeo'
    };

    var iceServers = {
        iceServers: [STUN]
    };

    if (isChrome) {
        if (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 28)
            TURN = {
                url: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            };

        iceServers.iceServers = [STUN, TURN];
    }

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var offerAnswerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    
	function onSdpError() {}


    // var answer = Answer.createAnswer(config);
    // answer.setRemoteDescription(sdp);
    // answer.addIceCandidate(candidate);
    var Answer = {
        createAnswer: function (config) 
		{
			alert(333);
            var peer = new RTCPeerConnection(iceServers, optionalArgument);
			
            if (config.MediaStream) peer.addStream(config.MediaStream);
            peer.onaddstream = function (event) 
			{
				
                config.onStreamAdded(event.stream);
            };

            peer.onicecandidate = function (event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
            peer.createAnswer(function (sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        addIceCandidate: function (candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    function merge(mergein, mergeto) {
        for (var t in mergeto) {
            mergein[t] = mergeto[t];
        }
        return mergein;
    }
	
	
	
})();
