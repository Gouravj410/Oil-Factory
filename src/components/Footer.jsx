import React from 'react'
import { motion } from 'framer-motion'
import '../styles/Footer.css'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        {/* Top Row */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <img src="./images/logo.jpeg" alt="Mateshwari Industries" className="footer-logo" />
              <div>
                <h3 className="footer-brand-name">Gold Mairani</h3>
                <p className="footer-brand-sub">By Mateshwari Industries</p>
              </div>
            </div>
            <p className="footer-brand-desc">
              Premium cooking oils trusted by families across India. 
              Pure quality in every drop.
            </p>
          </div>

          {/* Products */}
          <div className="footer-col">
            <h4 className="footer-col-title">Products</h4>
            <ul className="footer-links">
              <li><a href="#products">Pure Mustard Oil</a></li>
              <li><a href="#products">Refined Soya Oil</a></li>
              <li><a href="#products">Refined Cottonseed Oil</a></li>
              <li><a href="#products">All Products</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Quality Standards</a></li>
              <li><a href="#about">FSSAI Certified</a></li>
              <li><a href="#footer">Contact</a></li>
            </ul>
          </div>

          {/* Contact & Map */}
          <div className="footer-col" style={{ flex: '1.5' }}>
            <h4 className="footer-col-title">Get in Touch</h4>
            <div className="footer-contact-info">
              <p>info@mateshwariindustries.com</p>
              <p>+91 XXXXX XXXXX</p>
              <p>Rajasthan, India</p>
              
              {/* Google Maps Location Feature */}
              <div className="footer-map" style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.0436043135!2d73.7805658!3d18.5246036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="150" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mateshwari Industries Location Pune"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Mateshwari Industries. All rights reserved.
          </p>
          <p className="footer-tagline">
            Gold Mairani — Swad Ka Powerful Blast!
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
