import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Sdk from '../services/sdk';

import '../styles/presentation.less';

class Presentation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            slideUrl: null,
            canGoBack: false,
            canGoForward: false,
            slidePosition: 0,
            slideCount: 0,
            notes: null,
            isPresentationOwner: false,
            presentationHasNotes: this.props.presentation && Object.keys(this.props.presentation).length > 0,
            displayNotes: this.props.displayNotes,
        };

        this.previousSlide = this.previousSlide.bind(this);
        this.nextSlide = this.nextSlide.bind(this);
        this.updateSlide = this.updateSlide.bind(this);
        this.toggleNotes = this.toggleNotes.bind(this);
    }

    async componentDidMount() {
        VoxeetSDK.filePresentation.on('updated', this.updateSlide);

        // Load the current slide
        await this.updateSlide(VoxeetSDK.filePresentation.current);
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('updated', this.updateSlide);
    }

    async previousSlide(event) {
        event.preventDefault();
        event.stopPropagation();

        let currentPosition = VoxeetSDK.filePresentation.current.position;
        if (currentPosition > 0) {
            await Sdk.changeSlidePosition(currentPosition - 1);
        }
    }

    async nextSlide(event) {
        event.preventDefault();
        event.stopPropagation();
        
        let currentPosition = VoxeetSDK.filePresentation.current.position;
        if (currentPosition < VoxeetSDK.filePresentation.current.imageCount - 1) {
            await Sdk.changeSlidePosition(currentPosition + 1);
        }
    }

    async updateSlide(filePresentation) {
        try {
            const url = await Sdk.getSlideImageUrl(filePresentation.position);

            const current = VoxeetSDK.filePresentation.current;
            const isPresentationOwner = current.owner.id === VoxeetSDK.session.participant.id;
            const canGoBack = isPresentationOwner && current.position > 0;
            const canGoForward = isPresentationOwner && current.position < current.imageCount - 1;

            const notes = [];
            if (isPresentationOwner && this.state.presentationHasNotes) {
                if (Object.prototype.hasOwnProperty.call(this.props.presentation, current.position)) {
                    const slideNotes = this.props.presentation[current.position];
                    for (let index = 0; index < slideNotes.length; index++) {
                        const note = slideNotes[index];
                        const key = `notes-${index}`;
                        notes.push(<li key={key}>{note}</li>);
                    }
                }
            }

            this.setState({
                slideUrl: url,
                canGoBack: canGoBack,
                canGoForward: canGoForward,
                slidePosition: current.position + 1, // Index is 0
                slideCount: current.imageCount,
                isPresentationOwner: isPresentationOwner,
                notes: <ul>{notes}</ul>,
            });
        } catch (error) {
            console.error(error);
        }
    }

    toggleNotes(event, displayNotes) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({ displayNotes });
    }

    render() {
        return (
            <div className="presentation row flex-grow-1">
                <div className="col">
                    <div className="container-fluid d-flex h-100 flex-column">
                        <div className="row flex-grow-1">
                            {this.state.presentationHasNotes && this.state.isPresentationOwner && this.state.displayNotes ? (
                                <React.Fragment>
                                    <div className="image col-7" style={{ backgroundImage: `url(${this.state.slideUrl})` }} />
                                    <div className="notes col-5">{this.state.notes}</div>
                                </React.Fragment>
                            ) : (
                                <div className="image col" style={{ backgroundImage: `url(${this.state.slideUrl})` }} />
                            )}
                        </div>
                        {this.state.isPresentationOwner && (
                            <div className="row">
                                <div className="presentationActions">
                                    <a href="#" onClick={this.previousSlide} className={this.state.canGoBack ? '' : 'disabled'} title="Previous Slide">
                                        <i className="fas fa-chevron-left"></i>
                                    </a>
                                    {this.state.slidePosition} of {this.state.slideCount}
                                    <a href="#" onClick={this.nextSlide} className={this.state.canGoForward ? '' : 'disabled'} title="Next slide">
                                        <i className="fas fa-chevron-right"></i>
                                    </a>
                                    {this.state.presentationHasNotes && this.state.displayNotes && (
                                        <a href="#" onClick={(event) => this.toggleNotes(event, false)} title="Hide the notes">
                                            <i className="fas fa-sticky-note"></i>
                                        </a>
                                    )}
                                    {this.state.presentationHasNotes && !this.state.displayNotes && (
                                        <a href="#" onClick={(event) => this.toggleNotes(event, true)} title="Display the notes">
                                            <i className="far fa-sticky-note"></i>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

Presentation.propTypes = {
    presentation: PropTypes.object,
    displayNotes: PropTypes.bool,
};

Presentation.defaultProps = {
    presentation: null,
    displayNotes: false,
};

export default Presentation;
