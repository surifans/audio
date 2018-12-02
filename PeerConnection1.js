// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket

(function () {
	
    window.PeerConnection = function (channel, userid,local,remot) 
	{
		
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
		socket.send({         //初始化
			userLeft: true,
			userid: this.userid,  //当前学生id
			to: channel	//应该为要对话的老师的id
		});
		
		
        new Signaler(this, socket);
		
		this.addStream = function(stream) {	
			this.MediaStream = stream;
		};
		
		this.getUserMedia = function(callback) 
		{
			
			var constraints = {
					audio: true,
					video: {
                            optional: [],
                            mandatory: {}
                        }
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
				
                
				var audio = document.getElementById(video.id);
				if (audio) audio.parentNode.removeChild(audio);
				
				local.appendChild(video);
				

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
		
		
		this.onUserFound = function(userid) 
		{
			
			if(userid==channel)
			{
				
				if (document.getElementById(userid)) return;
				
				
				socket.send({
					participationRequest: true,
					userid: this.userid,
					to: this.participant
				});
			}
			
		};
		
		this.participat = function() 
		{
			//var audio = document.getElementById(channel);
			//if (audio) audio.parentNode.removeChild(audio);
			
			socket.send({
				participationRequest: true,
				userid: this.userid,
				to: channel
			});
			
			
		};
		
		
    };

    function Signaler(root, socket) 
	{
        var self = this;
		//var socket = socketURL;
		socket.onmessage = onmessage;//接受消息
		
		function onmessage(e) 
		{
			
			var message = JSON.parse(e.data);

            if (message.userid == root.userid) return;//root.userid为学生id
            
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
                var peer = root.peers[message.userid];
				if (peer) 
				{
					peer.addIceCandidate(message.candidate);
					
				} 
            }

            if (message.broadcasting && root.onUserFound ) 
			{
				//alert(123);
                root.onUserFound(message.userid);
            }
			
			if (message.userLeft && message.userid==root.participant) //  && message.to==root.userid
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
            
            onStreamAdded: function (stream) 
			{
				//alert(111);
                var video = document.createElement('video');
				
                video.id = root.participant;
				
				video.srcObject = stream;
				
				try {
                        video.setAttributeNode(document.createAttribute('autoplay'));
                        video.setAttributeNode(document.createAttribute('playsinline'));
                        video.setAttributeNode(document.createAttribute('controls'));
                    } catch (e) {
                        video.setAttribute('autoplay', true);
                        video.setAttribute('playsinline', true);
                        video.setAttribute('controls', true);
                    }
				
				
				
				if(video.id==channel)
				{
					var audio = document.getElementById(video.id);
					if (audio) audio.parentNode.removeChild(audio);
					
					remot.appendChild(video);
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

        

        root.onbeforeunload = function () 
		{
			//alert(root.participant);
            socket.send({
                userLeft: true,
                userid: root.userid,  //当前学生id
                to: root.participant	//应该为要对话的老师的id
            });
            closePeerConnections();
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
        //iceServers: [STUN]
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

	
    var Answer = {
        createAnswer: function (config) 
		{
			
            var peer = new RTCPeerConnection(iceServers, optionalArgument);
			
            if (config.MediaStream) peer.addStream(config.MediaStream);
            peer.onaddstream = function (event) 
			{
				//alert(333);
                config.onStreamAdded(event.stream);
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
