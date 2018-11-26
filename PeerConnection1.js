// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket

(function () {
	
    window.PeerConnection = function (socketURL, userid) {
        this.userid = userid ;
        this.peers = {};
		
        new Signaler(this, socketURL);
		
		this.addStream = function(stream) {	
			this.MediaStream = stream;
		};
    };

    function Signaler(root, socketURL) 
	{
        var self = this;

        root.sendParticipationRequest = function (userid) 
		{
			//alert(userid);
            socket.send({
                participationRequest: true,
                userid: root.userid,
                to: userid
            });
        };

        
        this.onsdp = function (message) // if someone shared SDP
		{
            var sdp = message.sdp;

            if (sdp.type == 'offer') 
			{
				//alert(111);
                root.peers[message.userid] = Answer.createAnswer(merge(options, {
                    MediaStream: root.MediaStream,
                    sdp: sdp
                }));
            }
			
        };


        var candidates = [];
        
        this.onice = function (message) // if someone shared ICE
		{
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
        };

        
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

        
		
		function onmessage(e) 
		{
			//
			//alert(111);
			var message = JSON.parse(e.data);

            if (message.userid == root.userid) return;
            root.participant = message.userid;

            

            
            if (message.sdp && message.to == root.userid) // if someone shared SDP
			{
                self.onsdp(message);
            }
			
            if (message.candidate && message.to == root.userid) // if someone shared ICE
			{
                self.onice(message);
            }

            
			
			
            if (message.broadcasting && root.onUserFound) 
			{
                root.onUserFound(message.userid);
            }

            
		}
		
		var socket = socketURL;
		
		socket.onmessage = onmessage;//接受消息
		
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
                to: root.participant
            });
            closePeerConnections();
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


    // var answer = Answer.createAnswer(config);
    // answer.setRemoteDescription(sdp);
    // answer.addIceCandidate(candidate);
    var Answer = {
        createAnswer: function (config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.MediaStream) peer.addStream(config.MediaStream);
            peer.onaddstream = function (event) 
			{
				//alert(222);
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
	
	window.URL = window.webkitURL || window.URL;
	navigator.getMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia = function(hints, onsuccess, onfailure) {
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
