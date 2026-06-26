import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Rewards.css';
import './ScannerPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Rewards = ({ onClose }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/schemes?active_only=true`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.schemes) {
          setSchemes(data.data.schemes);
        } else if (Array.isArray(data.data)) {
          setSchemes(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch schemes', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="sc-wrap" style={{ minHeight: 'auto', borderRadius: '20px', padding: '30px 20px', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      
      {/* Background Orbs */}
      <div className="sc-bg">
        <div className="sc-orb sc-orb--1"></div>
        <div className="sc-orb sc-orb--2"></div>
      </div>

      <button className="sc-close-btn" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="sc-container">
        <div className="sc-header">
          <div className="sc-icon-wrap">
            <span className="sc-icon"></span>
            <div className="sc-icon-pulse"></div>
          </div>
          <h2 className="sc-title">Exclusive Rewards</h2>
          <p className="sc-subtitle">Discover our latest <strong>offers & schemes</strong></p>
        </div>

        {loading ? (
          <div className="rewards-loader">Loading Rewards...</div>
        ) : schemes.length === 0 ? (
          <div className="rewards-empty" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
            <p style={{ margin: 0 }}>No active reward schemes at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="rewards-scroll-container" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
            <div className="rewards-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
              {schemes.map((scheme, i) => (
                <motion.div
                  key={scheme.id}
                  className="reward-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="reward-card-inner">
                    <div className="reward-badge">Offer</div>
                    <h3 className="reward-title">{scheme.title}</h3>
                    <p className="reward-desc">{scheme.description}</p>
                    
                    <div className="reward-details-box">
                      <div className="reward-highlight">
                        <span className="reward-icon"></span>
                        <span className="reward-text">{scheme.reward_text}</span>
                      </div>
                      <p className="reward-details">{scheme.reward_details}</p>
                    </div>

                    <div className="reward-footer">
                      <span className="reward-validity">
                        Valid until: {new Date(scheme.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;
