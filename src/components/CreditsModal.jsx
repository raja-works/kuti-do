
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './CreditsModal.css';

const CreditsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Credits</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    <section>
                        <h3>Sound Effects</h3>
                        <ul>
                            <li>
                                Brush Sound: <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=100953" target="_blank" rel="noopener noreferrer">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=100953" target="_blank" rel="noopener noreferrer">Pixabay</a>
                            </li>
                            <li>
                                Bucket Sound: <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=91567" target="_blank" rel="noopener noreferrer">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=91567" target="_blank" rel="noopener noreferrer">Pixabay</a>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h3>Icons</h3>
                        <p>Icons provided by <a href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer">React Icons</a> (Font Awesome).</p>
                    </section>

                    <section>
                        <h3>Libraries</h3>
                        <p>Built with Vite, React, OpenCV.js, PDF.js, and more.</p>
                    </section>

                    <div className="modal-footer">
                        <p>Made with ❤️ for Kids from zybernau</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditsModal;
