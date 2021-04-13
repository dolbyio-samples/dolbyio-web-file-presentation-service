import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import Sdk from "../actions/sdk";
import Recording from "./recording";

import "../styles/actions.less";


class Actions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            conferenceName: '',
            conferenceJoined: false,
            nbUsers: 0,
            nbListeners: 0,
            canStartVideo: false,
            canStopVideo: true,
            canMute: true,
            canUnmute: false
        };

        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.refreshStatus = this.refreshStatus.bind(this);
        this.startVideo = this.startVideo.bind(this);
        this.stopVideo = this.stopVideo.bind(this);
        this.mute = this.mute.bind(this);
        this.unmute = this.unmute.bind(this);
        this.leave = this.leave.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.onConferenceJoined);
        VoxeetSDK.conference.on('participantAdded', this.refreshStatus);
        VoxeetSDK.conference.on('participantUpdated', this.refreshStatus);

        this.refreshStatus();
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('joined', this.onConferenceJoined);
        VoxeetSDK.conference.removeListener('participantAdded', this.refreshStatus);
        VoxeetSDK.conference.removeListener('participantUpdated', this.refreshStatus);
    }

    onConferenceJoined() {
        this.setState({
            conferenceJoined: true
        });
    }

    refreshStatus() {
        var users = 0;
        var listeners = 0;

        VoxeetSDK.conference.participants.forEach(participant => {
            console.log("id", participant.id, "status", participant.status, "type", participant.type);
            console.log("name", participant.info.name, "externalId", participant.info.externalId);
            console.table(participant.metadata);

            if (participant.status === "Connected" || participant.status === "Inactive") {
                if (participant.type === "user" || participant.type === "speaker") {
                    users++;
                } else if (participant.type === "listener") {
                    listeners++;
                }
            }
        });

        const conferenceName = VoxeetSDK.conference.current.alias;

        const conferenceJoined = VoxeetSDK.conference.current != null;

        const canStartVideo = this.state.canStartVideo
            && conferenceJoined
            && VoxeetSDK.conference.current.permissions.has('SEND_VIDEO');
        const canStopVideo = this.state.canStopVideo
            && conferenceJoined
            && VoxeetSDK.conference.current.permissions.has('SEND_VIDEO');

        const canMute = this.state.canMute
            && conferenceJoined
            && VoxeetSDK.conference.current.permissions.has('SEND_AUDIO');
        const canUnmute = this.state.canUnmute
            && conferenceJoined
            && VoxeetSDK.conference.current.permissions.has('SEND_AUDIO');

        this.setState({
            conferenceName: conferenceName,
            nbUsers: users,
            nbListeners: listeners,
            canStartVideo: canStartVideo,
            canStopVideo: canStopVideo,
            canMute: canMute,
            canUnmute: canUnmute,
            conferenceJoined: conferenceJoined
        });
    }

    startVideo() {
        Sdk.startVideo()
            .then(() => {
                this.setState({
                    canStartVideo: false,
                    canStopVideo: true
                });
            })
            .catch((e) => console.log(e));
    }

    stopVideo() {
        Sdk.stopVideo()
            .then(() => {
                this.setState({
                    canStartVideo: true,
                    canStopVideo: false
                });
            })
            .catch((e) => console.log(e));
    }

    mute() {
        Sdk.mute();

        this.setState({
            canMute: false,
            canUnmute: true
        });
    }

    unmute() {
        Sdk.mute();

        this.setState({
            canMute: true,
            canUnmute: false
        });
    }

    leave() {
        Sdk.leaveConference();
    }

    render() {
        if (!this.state.conferenceJoined) {
            return '';
        }

        return (
            <div className="actions row">
                <div className="col">
                    <div className="d-flex justify-content-between">
                        <div className="col-left">
                            <Recording />
                            <span className="separator" />

                            <span>{this.state.nbUsers} user{this.state.nbUsers > 1 ? "s" : ""} / {this.state.nbListeners} listener{this.state.nbListeners > 1 ? "s" : ""}</span>
                        </div>
                        <div className="col-center">
                            <span>{this.state.conferenceName}</span>
                        </div>
                        <div className="col-right">
                            <span className="separator" />
                            {this.state.canStartVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.startVideo} title="Start the video">
                                    <i className="fas fa-video-slash"></i>
                                </button>
                            )}
                            {this.state.canStopVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.stopVideo} title="Stop the video">
                                    <i className="fas fa-video"></i>
                                </button>
                            )}
                            {this.state.canMute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.mute} title="Mute the microphone">
                                    <i className="fas fa-microphone"></i>
                                </button>
                            )}
                            {this.state.canUnmute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.unmute} title="Unmute the microphone">
                                    <i className="fas fa-microphone-slash"></i>
                                </button>
                            )}
                            <button type="button" className="btn btn-danger btn-xl" onClick={this.leave} title="Leave the conference">
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Actions.propTypes = {
    
};

Actions.defaultProps = {
    
};

export default Actions;
