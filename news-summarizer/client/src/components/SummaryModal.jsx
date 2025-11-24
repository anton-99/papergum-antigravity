import React from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import './SummaryModal.css';

const SummaryModal = ({ isOpen, onClose, summary, isLoading, title }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-wrapper">
                        <Sparkles className="modal-icon" size={20} />
                        <h2 className="modal-title">AI Summary</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Generating summary...</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="article-title">{title}</h3>
                            <div className="summary-text">
                                {summary}
                            </div>
                        </>
                    )}
                </div>

                {!isLoading && (
                    <div className="modal-footer">
                        <button className="btn btn-ghost" onClick={handleCopy}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied' : 'Copy Text'}
                        </button>
                        <button className="btn btn-primary" onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryModal;
