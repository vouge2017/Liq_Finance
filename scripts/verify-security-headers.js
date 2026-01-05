#!/usr/bin/env node

/**
 * Security Headers Verification Script
 * Tests that security headers are properly configured in deployment files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read configuration files
const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf8'));
const netlifyConfig = fs.readFileSync(path.join(__dirname, '../netlify.toml'), 'utf8');
const headersFile = fs.readFileSync(path.join(__dirname, '../public/_headers'), 'utf8');

// Expected security headers
const expectedHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy',
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'Cross-Origin-Embedder-Policy',
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Resource-Policy'
];

const expectedCSPDirectives = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://api.supabase.io https://gemini.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
];

function checkVercelHeaders() {
    console.log('🔍 Checking Vercel configuration...');

    if (!vercelConfig.headers) {
        console.error('❌ Vercel: No headers configuration found');
        return false;
    }

    const headers = vercelConfig.headers[0].headers;
    let allHeadersPresent = true;

    expectedHeaders.forEach(header => {
        const headerExists = headers.some(h => h.key === header);
        if (!headerExists) {
            console.error(`❌ Vercel: Missing header ${header}`);
            allHeadersPresent = false;
        } else {
            console.log(`✅ Vercel: ${header} present`);
        }
    });

    // Check CSP content
    const cspHeader = headers.find(h => h.key === 'Content-Security-Policy');
    if (cspHeader) {
        const cspValue = cspHeader.value;
        expectedCSPDirectives.forEach(directive => {
            if (!cspValue.includes(directive)) {
                console.error(`❌ Vercel: CSP missing directive: ${directive}`);
                allHeadersPresent = false;
            }
        });
    }

    return allHeadersPresent;
}

function checkNetlifyHeaders() {
    console.log('\n🔍 Checking Netlify configuration...');

    let allHeadersPresent = true;

    expectedHeaders.forEach(header => {
        const headerPattern = new RegExp(`${header}\\s*=`, 'i');
        if (!headerPattern.test(netlifyConfig)) {
            console.error(`❌ Netlify: Missing header ${header}`);
            allHeadersPresent = false;
        } else {
            console.log(`✅ Netlify: ${header} present`);
        }
    });

    // Check CSP content
    if (netlifyConfig.includes('Content-Security-Policy')) {
        expectedCSPDirectives.forEach(directive => {
            if (!netlifyConfig.includes(directive)) {
                console.error(`❌ Netlify: CSP missing directive: ${directive}`);
                allHeadersPresent = false;
            }
        });
    }

    return allHeadersPresent;
}

function checkHeadersFile() {
    console.log('\n🔍 Checking _headers file...');

    let allHeadersPresent = true;

    expectedHeaders.forEach(header => {
        const headerPattern = new RegExp(`^\\s*${header}:`, 'm');
        if (!headerPattern.test(headersFile)) {
            console.error(`❌ _headers: Missing header ${header}`);
            allHeadersPresent = false;
        } else {
            console.log(`✅ _headers: ${header} present`);
        }
    });

    // Check CSP content
    if (headersFile.includes('Content-Security-Policy')) {
        expectedCSPDirectives.forEach(directive => {
            if (!headersFile.includes(directive)) {
                console.error(`❌ _headers: CSP missing directive: ${directive}`);
                allHeadersPresent = false;
            }
        });
    }

    return allHeadersPresent;
}

function main() {
    console.log('🛡️  Security Headers Verification\n');

    const vercelOk = checkVercelHeaders();
    const netlifyOk = checkNetlifyHeaders();
    const headersFileOk = checkHeadersFile();

    console.log('\n📊 Summary:');
    console.log(`Vercel configuration: ${vercelOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Netlify configuration: ${netlifyOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`_headers file: ${headersFileOk ? '✅ PASS' : '❌ FAIL'}`);

    if (vercelOk && netlifyOk && headersFileOk) {
        console.log('\n🎉 All security headers are properly configured!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some security headers are missing or misconfigured.');
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { checkVercelHeaders, checkNetlifyHeaders, checkHeadersFile };