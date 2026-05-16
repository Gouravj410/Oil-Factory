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

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Get in Touch</h4>
            <div className="footer-contact-info">
              <p>info@mateshwariindustries.com</p>
              <p>+91 XXXXX XXXXX</p>
              <p>Rajasthan, India</p>
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
