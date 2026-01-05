/**
 * Privacy Policy Component
 * GDPR-compliant privacy policy for Liq_Finance
 */

import React from 'react'
import { Shield, Lock, Eye, Database, UserCheck, FileText, Globe, Calendar } from 'lucide-react'

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-theme-main text-theme-primary">
            {/* Header */}
            <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <Shield size={48} className="mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-xl opacity-90 mb-2">Liq_Finance - Your Privacy Matters</p>
                    <p className="text-sm opacity-75">Last updated: December 22, 2025</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Quick Summary */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <Eye className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-cyan-400 mb-2">Privacy at a Glance</h3>
                            <p className="text-sm text-cyan-200">
                                We process your financial data to provide personalized insights and automation features.
                                You have full control over what data we process through our consent management system.
                                We never sell your data and use industry-standard encryption to protect your information.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="bg-theme-card rounded-2xl p-6 mb-8 border border-theme">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Table of Contents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <a href="#who-we-are" className="text-cyan-400 hover:text-cyan-300 py-1">1. Who We Are</a>
                        <a href="#what-data" className="text-cyan-400 hover:text-cyan-300 py-1">2. What Data We Collect</a>
                        <a href="#how-we-use" className="text-cyan-400 hover:text-cyan-300 py-1">3. How We Use Your Data</a>
                        <a href="#legal-basis" className="text-cyan-400 hover:text-cyan-300 py-1">4. Legal Basis for Processing</a>
                        <a href="#data-sharing" className="text-cyan-400 hover:text-cyan-300 py-1">5. Data Sharing</a>
                        <a href="#data-security" className="text-cyan-400 hover:text-cyan-300 py-1">6. Data Security</a>
                        <a href="#data-retention" className="text-cyan-400 hover:text-cyan-300 py-1">7. Data Retention</a>
                        <a href="#your-rights" className="text-cyan-400 hover:text-cyan-300 py-1">8. Your Rights</a>
                        <a href="#cookies" className="text-cyan-400 hover:text-cyan-300 py-1">9. Cookies & Tracking</a>
                        <a href="#international-transfers" className="text-cyan-400 hover:text-cyan-300 py-1">10. International Transfers</a>
                        <a href="#children" className="text-cyan-400 hover:text-cyan-300 py-1">11. Children's Privacy</a>
                        <a href="#changes" className="text-cyan-400 hover:text-cyan-300 py-1">12. Changes to This Policy</a>
                        <a href="#contact" className="text-cyan-400 hover:text-cyan-300 py-1">13. Contact Us</a>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* Section 1 */}
                    <section id="who-we-are" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <UserCheck className="w-6 h-6 text-cyan-400" />
                            1. Who We Are
                        </h2>
                        <p className="text-theme-secondary mb-4">
                            Liq_Finance ("we," "our," or "us") is a personal financial management application designed to help Ethiopian users
                            manage their finances, track expenses, and achieve their financial goals through intelligent automation and insights.
                        </p>
                        <p className="text-theme-secondary">
                            <strong>Data Controller:</strong> Liq_Finance<br />
                            <strong>Email:</strong> privacy@liqfinance.com<br />
                            <strong>Location:</strong> Addis Ababa, Ethiopia
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section id="what-data" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Database className="w-6 h-6 text-cyan-400" />
                            2. What Data We Collect
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>Name and contact information</li>
                                    <li>Phone number and country code</li>
                                    <li>Profile preferences and settings</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Financial Data</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>Bank account information and balances</li>
                                    <li>Transaction history and patterns</li>
                                    <li>Budget categories and spending limits</li>
                                    <li>Savings goals and progress</li>
                                    <li>Income sources and salary information</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Usage Data</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>App usage patterns and feature interactions</li>
                                    <li>Device information and technical data</li>
                                    <li>Voice recordings (with consent)</li>
                                    <li>SMS messages for transaction parsing (with consent)</li>
                                    <li>Receipt images (with consent)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section id="how-we-use" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-cyan-400" />
                            3. How We Use Your Data
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Core Services</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>Provide financial tracking and budgeting features</li>
                                    <li>Generate personalized insights and recommendations</li>
                                    <li>Automate transaction categorization and entry</li>
                                    <li>Sync data across your devices</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Enhanced Features (With Consent)</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>AI-powered financial advisor and recommendations</li>
                                    <li>Voice-to-text transaction entry</li>
                                    <li>Receipt image analysis and data extraction</li>
                                    <li>Community features and social sharing</li>
                                    <li>Marketing communications and product updates</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Legal and Security</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>Comply with legal obligations</li>
                                    <li>Detect and prevent fraud</li>
                                    <li>Protect against security threats</li>
                                    <li>Resolve disputes and enforce our terms</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section id="legal-basis" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-cyan-400" />
                            4. Legal Basis for Processing
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Contract (Article 6(1)(b))</h3>
                                <p className="text-sm text-cyan-200">
                                    Processing necessary to provide core financial management services you request.
                                </p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-green-400 mb-2">Consent (Article 6(1)(a))</h3>
                                <p className="text-sm text-green-200">
                                    Processing based on your explicit consent for features like AI advisor, SMS parsing,
                                    voice processing, and marketing communications. You can withdraw consent at any time.
                                </p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-amber-400 mb-2">Legitimate Interest (Article 6(1)(f))</h3>
                                <p className="text-sm text-amber-200">
                                    Anonymous analytics and usage data to improve our services, with opt-out options available.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section id="data-sharing" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">5. Data Sharing</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-red-400">We Do NOT Sell Your Data</h3>
                                <p className="text-theme-secondary mb-4">
                                    We never sell, rent, or trade your personal information to third parties for marketing purposes.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Limited Data Sharing</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li><strong>Service Providers:</strong> Cloud hosting and infrastructure partners (Supabase, with encryption)</li>
                                    <li><strong>AI Services:</strong> Gemini AI for financial insights (only with your consent)</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                                    <li><strong>Business Transfers:</strong> In case of merger or acquisition (with prior notice)</li>
                                </ul>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Ethiopian Banking Integration</h3>
                                <p className="text-sm text-blue-200">
                                    When you connect your bank accounts, data is shared with your financial institutions
                                    as necessary to provide account balance and transaction information.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section id="data-security" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-cyan-400" />
                            6. Data Security
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Encryption</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>Data encrypted in transit (TLS 1.3)</li>
                                    <li>Data encrypted at rest (AES-256)</li>
                                    <li>End-to-end encryption for sensitive financial data</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Access Controls</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li>Row-level security in database</li>
                                    <li>Multi-factor authentication support</li>
                                    <li>Regular security audits and updates</li>
                                    <li>Limited employee access on need-to-know basis</li>
                                </ul>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-amber-400 mb-2">Breach Notification</h3>
                                <p className="text-sm text-amber-200">
                                    We will notify you and relevant authorities within 72 hours if we become aware of a data breach
                                    affecting your personal information.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section id="data-retention" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-cyan-400" />
                            7. Data Retention
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Retention Periods</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1">
                                    <li><strong>Financial Transactions:</strong> 7 years (Ethiopian banking requirements)</li>
                                    <li><strong>User Profiles & Account Data:</strong> 2 years after last activity</li>
                                    <li><strong>Temporary Data (feedback, AI conversations):</strong> 30 days</li>
                                    <li><strong>Marketing Data:</strong> Until consent withdrawn or 2 years</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Automated Deletion</h3>
                                <p className="text-theme-secondary">
                                    We automatically delete data according to these retention periods using scheduled background processes.
                                    You can also request immediate deletion of your data at any time.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section id="your-rights" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">8. Your Rights Under GDPR</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Right to Access</h3>
                                    <p className="text-sm text-cyan-200">
                                        Request a copy of all personal data we hold about you
                                    </p>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-400 mb-2">Right to Rectification</h3>
                                    <p className="text-sm text-green-200">
                                        Correct any inaccurate or incomplete data
                                    </p>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-red-400 mb-2">Right to Erasure</h3>
                                    <p className="text-sm text-red-200">
                                        Request deletion of your personal data ("Right to be Forgotten")
                                    </p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Right to Portability</h3>
                                    <p className="text-sm text-blue-200">
                                        Export your data in a standard, machine-readable format
                                    </p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-amber-400 mb-2">Right to Restrict Processing</h3>
                                    <p className="text-sm text-amber-200">
                                        Limit how we process your data
                                    </p>
                                </div>
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Right to Object</h3>
                                    <p className="text-sm text-purple-200">
                                        Object to processing based on legitimate interests or direct marketing
                                    </p>
                                </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-green-400 mb-2">How to Exercise Your Rights</h3>
                                <p className="text-sm text-green-200">
                                    You can exercise these rights through the Data Management section in the app,
                                    or by contacting us at privacy@liqfinance.com. We will respond within 30 days.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section id="cookies" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">9. Cookies & Tracking</h2>
                        <p className="text-theme-secondary mb-4">
                            Liq_Finance uses minimal tracking to provide essential functionality. We use:
                        </p>
                        <ul className="list-disc list-inside text-theme-secondary space-y-1">
                            <li><strong>Essential Cookies:</strong> Required for app functionality and security</li>
                            <li><strong>Anonymous Analytics:</strong> To improve app performance (opt-out available)</li>
                            <li><strong>Local Storage:</strong> To sync your data across sessions</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section id="international-transfers" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
                        <p className="text-theme-secondary mb-4">
                            Some of our service providers may be located outside the EEA/EU. When we transfer data internationally,
                            we ensure adequate protection through:
                        </p>
                        <ul className="list-disc list-inside text-theme-secondary space-y-1">
                            <li>Adequacy decisions by the European Commission</li>
                            <li>Standard Contractual Clauses (SCCs)</li>
                            <li>Certification schemes and codes of conduct</li>
                        </ul>
                    </section>

                    {/* Section 11 */}
                    <section id="children" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">11. Children's Privacy</h2>
                        <p className="text-theme-secondary">
                            Liq_Finance is not intended for children under 13 years of age. We do not knowingly collect
                            personal information from children under 13. If you become aware that a child has provided
                            us with personal information, please contact us immediately.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section id="changes" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
                        <p className="text-theme-secondary">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes
                            by posting the new policy on this page and updating the "Last updated" date. Your continued use
                            of the service after changes constitutes acceptance of the new policy.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section id="contact" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Data Protection Officer</h3>
                                <p className="text-theme-secondary">
                                    Email: privacy@liqfinance.com<br />
                                    Address: Addis Ababa, Ethiopia
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Supervisory Authority</h3>
                                <p className="text-theme-secondary">
                                    If you are not satisfied with our response, you have the right to lodge a complaint
                                    with your local data protection authority.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Back to App Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => window.close()}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors"
                    >
                        Back to Liq_Finance
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy