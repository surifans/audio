// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket

(function () {
	
    window.PeerConnection = function (channel, userid,local,remot) {
        this.userid = userid ;
        this.peers = {};
		
		var pub = 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0';
		var sub = 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a';
		WebSocket  = PUBNUB.ws;
		var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + channel);	
		websocket.push = websocket.send;
		websocket.send = function(data) {
			websocket.push(JSON.stringify(data));
		};
		
		var socket = websocket;
		socket.send({         //初始化
			userLeft: true,
			userid: channel,  //当前学生id
			//to: channel	//应该为要对话的老师的id
		});
		
		
		
        new Signaler(this, socket);
		
		this.addStream = function(stream) 
		{	
			this.MediaStream = stream;
		};
		
		this.getUserMedia = function(callback) 
		{
			
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
		
		this.onStreamAdded = function(e) //这里是创建远端连接 
		{
			
			var audio = e.mediaElement;
			
			if (document.getElementById(audio.id)) 
			{
				
				var video = document.getElementById(video.id);
				if (video) video.parentNode.removeChild(video);
			}
			
			remot.appendChild(audio);
			
		};
		
    };

    function Signaler(root, socket) 
	{
        var self = this;
		//var socket = socketURL;
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
				
				
                mediaElement.id = root.participant;
                
				var agent = navigator.userAgent.toLowerCase() ;//判断是否是谷歌浏览器
				if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) 
				{
					mediaElement.muted = true;
				}
				else{
					mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.URL.createObjectURL(stream);
					mediaElement.pause();
				}
				
				mediaElement.autoplay = true;
                mediaElement.controls = true;
				mediaElement.srcObject = stream;
				
                
				
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

	var IceServersHandler = (function() 
	{
        function getIceServers(connection) {
            var iceServers = [];

            iceServers.push(getSTUNObj('stun:stun.l.google.com:19302'));

            iceServers.push(getTURNObj('stun:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
            iceServers.push(getTURNObj('turn:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
            iceServers.push(getTURNObj('turn:webrtcweb.com:8877', 'muazkh', 'muazkh')); // coTURN

            iceServers.push(getTURNObj('turns:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
            iceServers.push(getTURNObj('turns:webrtcweb.com:8877', 'muazkh', 'muazkh')); // coTURN

            // iceServers.push(getTURNObj('turn:webrtcweb.com:3344', 'muazkh', 'muazkh')); // resiprocate
            // iceServers.push(getTURNObj('turn:webrtcweb.com:4433', 'muazkh', 'muazkh')); // resiprocate

            // check if restund is still active: http://webrtcweb.com:4050/
            iceServers.push(getTURNObj('stun:webrtcweb.com:4455', 'muazkh', 'muazkh')); // restund
            iceServers.push(getTURNObj('turn:webrtcweb.com:4455', 'muazkh', 'muazkh')); // restund
            iceServers.push(getTURNObj('turn:webrtcweb.com:5544?transport=tcp', 'muazkh', 'muazkh')); // restund

            return iceServers;
        }

        function getSTUNObj(stunStr) {
            var urlsParam = 'urls';
            if (typeof isPluginRTC !== 'undefined') {
                urlsParam = 'url';
            }

            var obj = {};
            obj[urlsParam] = stunStr;
            return obj;
        }

        function getTURNObj(turnStr, username, credential) {
            var urlsParam = 'urls';
            if (typeof isPluginRTC !== 'undefined') {
                urlsParam = 'url';
            }

            var obj = {
                username: username,
                credential: credential
            };
            obj[urlsParam] = turnStr;
            return obj;
        }

        return {
            getIceServers: getIceServers
        };
    })();
	
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
        iceServers: IceServersHandler.getIceServers()
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
	
	
	
})();
