// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket

(function () {
	
    window.PeerConnection = function (socketURL, userid) {
        this.userid = userid ;
        this.peers = {};
		
        new Signaler(this, socketURL);
		
		this.addStream = function(stream) 
		{	
			this.MediaStream = stream;
		};
    };

    function Signaler(root, socketURL) 
	{
        var self = this;
		var socket = socketURL;
		socket.onmessage = onmessage;//接受消息
		
		root.startBroadcasting = function () //老师开始播音，一般是创建教室的人调用这个函数
		{
			
            (function transmit() 
			{
                socket.send({
                    userid: root.userid,
                    broadcasting: true
                });
				//alert(222);
                //!self.participantFound &&!self.stopBroadcasting &&setTimeout(transmit, 1000);
				setTimeout(transmit, 1000);//这里一直发送信号，让学生加入
				
            })();
        };
		
		
		function onmessage(e) 
		{
			
			var message = JSON.parse(e.data);
			
			
			
            if (message.userid == root.userid) return;
            //alert(000);
			
			if (message.userLeft && message.to == root.userid) 
			{
				//alert(111);
                var video = document.getElementById(message.userid);
				if (video) 
				{
					video.parentNode.removeChild(video);
					root.peers[message.userid].peer.close();
					root.peers[message.userid] = {};
					
				}	
            }
			if (message.participationRequest && message.to == root.userid) // if someone sent participation request
			{
				/*if(root.peers[message.userid])//先初始化一下
				{
					root.peers[message.userid].peer.close();
					root.peers[message.userid] = {};
				}
				var video = document.getElementById(message.userid);
				if (video) 
				{
					video.parentNode.removeChild(video);
				}*/	
				//alert(222);
				root.participant = message.userid;
				root.peers[message.userid] = Offer.createOffer(merge(options, 
				{
					MediaStream: root.MediaStream
				}));
            }
			
            if (message.sdp && message.to == root.userid) // if someone shared SDP
			{
				//alert(333);
				var sdp = message.sdp;
				if (sdp.type == 'answer') 
				{
					root.peers[message.userid].setRemoteDescription(sdp);
				}
            }
			
            if (message.candidate && message.to == root.userid) // if someone shared ICE
			{
				//alert(444);
                var candidates = [];
				var peer = root.peers[message.userid];
				if (peer) 
				{
					peer.addIceCandidate(message.candidate);
				} 
				/*var peer = peers[message.userid];
				if (!peer) {
					var candidate = candidates[message.userid];
					if (candidate) candidates[message.userid][candidate.length] = message.candidate;
					else candidates[message.userid] = [message.candidate];
				} else {
					peer.addIceCandidate(message.candidate);

					var _candidates = candidates[message.userid] || [];
					if (_candidates.length) {
						for (var i = 0; i < _candidates.length; i++) {
							peer.addIceCandidate(_candidates[i]);
						}
						candidates[message.userid] = [];
					}
				}*/
				
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
            onicecandidate: function (candidate) {
                socket.send({
                    userid: root.userid,
                    candidate: candidate,
                    to: root.participant
                });
            },
            onStreamAdded: function (stream) 
			{
                
				
                var mediaElement = document.createElement('audio');
				
				var agent = navigator.userAgent.toLowerCase() ;//判断是否是谷歌浏览器
				if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) 
				{
					//audio['src'] = window.URL.createObjectURL(stream);
				}
				else{
					mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.URL.createObjectURL(stream);
				}
				
				
                mediaElement.id = root.participant;
                mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                mediaElement.autoplay = true;
                mediaElement.controls = true;
				mediaElement.srcObject = stream;
				
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

        function closePeerConnections() {
            //self.stopBroadcasting = true;
            if (root.MediaStream) root.MediaStream.stop();

            for (var userid in root.peers) {
                root.peers[userid].peer.close();
            }
            root.peers = {};
        }

        root.close = function () {
            socket.send({
                userLeft: true,
                userid: root.userid,
                //to: root.participant
            });
            //closePeerConnections();
        };

        window.onbeforeunload = function () {
			//alert(111);
            root.close();
        };
		
		
		
		
		
		
    }

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.webkitURL || window.URL;

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
	
    var Offer = 
	{
        createOffer: function (config) 
		{
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.MediaStream) peer.addStream(config.MediaStream);
            peer.onaddstream = function (event) 
			{
				//alert(111);
                config.onStreamAdded(event.stream);
            };

            peer.onicecandidate = function (event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

            peer.createOffer(function (sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function (sdp) 
		{
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addIceCandidate: function (candidate) 
		{
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
	
	window.URL = window.webkitURL || window.URL;
	navigator.getMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia = function(hints, onsuccess, onfailure) 
	{
		if(!hints) hints = {audio:true,video:true};
		if(!onsuccess) throw 'Second argument is mandatory. navigator.getUserMedia(hints,onsuccess,onfailure)';
		
		navigator.getMedia(hints, _onsuccess, _onfailure);
		
		function _onsuccess(stream) {
			onsuccess(stream);
		}
		
		function _onfailure(e) {
			if(onfailure) onfailure(e);
			else throw Error('getUserMedia failed: ' + JSON.stringify(e, null, '\t'));
		}
	};
	
})();
