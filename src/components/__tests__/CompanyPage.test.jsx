import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CompanyPage from '../CompanyPage';

// Mock matchMedia to prevent errors in JSDOM
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe('CompanyPage Component', () => {
    it('renders the CompanyPage heading', () => {
        render(
            <BrowserRouter>
                <CompanyPage />
            </BrowserRouter>
        );
        // Ensure "Mateshwari Industries" text exists in the document
        expect(screen.getByText(/Mateshwari Industries/i)).toBeInTheDocument();
    });
});
