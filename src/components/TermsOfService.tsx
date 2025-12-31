/**
 * Terms of Service Component
 * Legal terms and conditions for Liq_Finance
 */

import React from 'react'
import { FileText, Scale, Shield, AlertTriangle, CheckCircle, Users, Globe } from 'lucide-react'

export const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-theme-main text-theme-primary">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <Scale size={48} className="mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-xl opacity-90 mb-2">Legal Terms for Liq_Finance</p>
                    <p className="text-sm opacity-75">Last updated: December 22, 2025</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Quick Summary */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-purple-400 mb-2">Terms Summary</h3>
                            <p className="text-sm text-purple-200">
                                By using Liq_Finance, you agree to these terms. We provide financial management tools on an "as is" basis.
                                You're responsible for your financial decisions and must comply with Ethiopian banking laws.
                                We protect your data and never sell it to third parties.
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
                        <a href="#acceptance" className="text-purple-400 hover:text-purple-300 py-1">1. Acceptance of Terms</a>
                        <a href="#description" className="text-purple-400 hover:text-purple-300 py-1">2. Service Description</a>
                        <a href="#eligibility" className="text-purple-400 hover:text-purple-300 py-1">3. Eligibility & Account</a>
                        <a href="#user-responsibilities" className="text-purple-400 hover:text-purple-300 py-1">4. User Responsibilities</a>
                        <a href="#financial-advisor" className="text-purple-400 hover:text-purple-300 py-1">5. AI Financial Advisor</a>
                        <a href="#intellectual-property" className="text-purple-400 hover:text-purple-300 py-1">6. Intellectual Property</a>
                        <a href="#data-privacy" className="text-purple-400 hover:text-purple-300 py-1">7. Data & Privacy</a>
                        <a href="#disclaimers" className="text-purple-400 hover:text-purple-300 py-1">8. Disclaimers</a>
                        <a href="#limitation-liability" className="text-purple-400 hover:text-purple-300 py-1">9. Limitation of Liability</a>
                        <a href="#indemnification" className="text-purple-400 hover:text-purple-300 py-1">10. Indemnification</a>
                        <a href="#termination" className="text-purple-400 hover:text-purple-300 py-1">11. Termination</a>
                        <a href="#governing-law" className="text-purple-400 hover:text-purple-300 py-1">12. Governing Law</a>
                        <a href="#changes" className="text-purple-400 hover:text-purple-300 py-1">13. Changes to Terms</a>
                        <a href="#contact" className="text-purple-400 hover:text-purple-300 py-1">14. Contact Information</a>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* Section 1 */}
                    <section id="acceptance" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-purple-400" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-theme-secondary mb-4">
                            By accessing or using Liq_Finance ("the Service"), you agree to be bound by these Terms of Service ("Terms").
                            If you disagree with any part of these terms, then you may not access the Service.
                        </p>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                            <p className="text-sm text-purple-200">
                                <strong>Important:</strong> These Terms constitute a legally binding agreement between you and Liq_Finance.
                                Please read them carefully before using our service.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="description" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-purple-400" />
                            2. Service Description
                        </h2>
                        <p className="text-theme-secondary mb-4">
                            Liq_Finance is a personal financial management application designed specifically for Ethiopian users.
                            Our service provides:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Core Features</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>Personal financial tracking and budgeting</li>
                                    <li>Transaction management and categorization</li>
                                    <li>Savings goals and progress tracking</li>
                                    <li>Multi-currency support (ETB, USD)</li>
                                    <li>Ethiopian calendar integration</li>
                                    <li>Offline functionality</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Enhanced Features</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>AI-powered financial advisor</li>
                                    <li>Automated SMS transaction parsing</li>
                                    <li>Voice-to-text transaction entry</li>
                                    <li>Receipt image analysis</li>
                                    <li>Community features and sharing</li>
                                    <li>Family financial management</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section id="eligibility" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">3. Eligibility & Account</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Age Requirement</h3>
                                <p className="text-theme-secondary">
                                    You must be at least 18 years old to use Liq_Finance. By using our service,
                                    you represent and warrant that you meet this age requirement.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Account Registration</h3>
                                <p className="text-theme-secondary mb-2">
                                    To use certain features, you must create an account. You agree to:
                                </p>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>Provide accurate, current, and complete information</li>
                                    <li>Maintain and promptly update your account information</li>
                                    <li>Keep your login credentials secure and confidential</li>
                                    <li>Notify us immediately of any unauthorized access</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Geographic Limitation</h3>
                                <p className="text-theme-secondary">
                                    Liq_Finance is primarily designed for users in Ethiopia. If you are accessing the service
                                    from outside Ethiopia, you are responsible for compliance with local laws.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section id="user-responsibilities" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">4. User Responsibilities</h2>
                        <div className="space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-amber-400 mb-2">Financial Responsibility</h3>
                                <p className="text-sm text-amber-200">
                                    You are solely responsible for all financial decisions, transactions, and actions taken
                                    through or in connection with our service. Liq_Finance is an informational tool only.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Prohibited Uses</h3>
                                <p className="text-theme-secondary mb-2">You may not use Liq_Finance to:</p>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Transmit malicious code or attempt to gain unauthorized access</li>
                                    <li>Impersonate any person or entity</li>
                                    <li>Use the service for any fraudulent or illegal purpose</li>
                                    <li>Interfere with or disrupt the service or servers</li>
                                    <li>Attempt to reverse engineer or copy our software</li>
                                    <li>Use automated systems to access our service</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section id="financial-advisor" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-purple-400" />
                            5. AI Financial Advisor
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Not Financial Advice</h3>
                                <p className="text-sm text-red-200">
                                    The AI Financial Advisor provides general information and suggestions only.
                                    This is NOT personalized financial advice, investment advice, or professional consultation.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Limitations</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>AI recommendations are based on patterns and may not suit your specific situation</li>
                                    <li>We do not guarantee the accuracy or completeness of AI-generated insights</li>
                                    <li>You should consult qualified financial professionals for important decisions</li>
                                    <li>AI responses are generated by third-party services (Gemini AI)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Your Discretion</h3>
                                <p className="text-theme-secondary">
                                    You use AI features at your own risk and discretion. Always verify recommendations
                                    and consider your personal circumstances before making financial decisions.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section id="intellectual-property" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Our Rights</h3>
                                <p className="text-theme-secondary mb-2">
                                    Liq_Finance and its original content, features, and functionality are owned by us and are protected by
                                    international copyright, trademark, patent, trade secret, and other intellectual property laws.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Your Data</h3>
                                <p className="text-theme-secondary">
                                    You retain ownership of your personal data. By using our service, you grant us a limited license
                                    to process your data as described in our Privacy Policy and with your consent.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                                <p className="text-theme-secondary">
                                    If you provide feedback or suggestions, you grant us the right to use them without compensation or attribution.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section id="data-privacy" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">7. Data & Privacy</h2>
                        <p className="text-theme-secondary mb-4">
                            Your privacy is important to us. Our data practices are governed by our Privacy Policy,
                            which is incorporated into these Terms by reference.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Key Privacy Principles</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>We never sell your personal data</li>
                                    <li>Data encryption at rest and in transit</li>
                                    <li>You control data processing through consent</li>
                                    <li>Regular security audits and updates</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>Access your data at any time</li>
                                    <li>Correct inaccurate information</li>
                                    <li>Delete your data ("right to be forgotten")</li>
                                    <li>Export your data in standard formats</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section id="disclaimers" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                            8. Disclaimers
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-amber-400 mb-2">Service "As Is"</h3>
                                <p className="text-sm text-amber-200">
                                    Liq_Finance is provided "as is" and "as available" without warranties of any kind.
                                    We do not guarantee uninterrupted or error-free service.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">No Warranties</h3>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>No warranty of accuracy or completeness</li>
                                    <li>No warranty of fitness for a particular purpose</li>
                                    <li>No warranty of non-infringement</li>
                                    <li>No guarantee of continuous availability</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Third-Party Services</h3>
                                <p className="text-theme-secondary">
                                    We integrate with third-party services (banks, AI providers). We are not responsible
                                    for their availability, accuracy, or practices.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section id="limitation-liability" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                        <div className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Maximum Liability</h3>
                                <p className="text-sm text-red-200">
                                    To the fullest extent permitted by law, our total liability shall not exceed
                                    the amount you paid us for the service in the 12 months preceding the claim.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Excluded Damages</h3>
                                <p className="text-theme-secondary mb-2">We shall not be liable for:</p>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>Indirect, incidental, or consequential damages</li>
                                    <li>Loss of profits, data, or business opportunities</li>
                                    <li>Damages resulting from financial decisions</li>
                                    <li>Damages from third-party actions or services</li>
                                    <li>Damages from service interruptions</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section id="indemnification" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
                        <p className="text-theme-secondary">
                            You agree to indemnify, defend, and hold harmless Liq_Finance and its affiliates from any claims,
                            damages, losses, or expenses arising from:
                        </p>
                        <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm mt-2">
                            <li>Your use of the service in violation of these Terms</li>
                            <li>Your violation of applicable laws or regulations</li>
                            <li>Your violation of any third-party rights</li>
                            <li>Any content or data you submit through our service</li>
                        </ul>
                    </section>

                    {/* Section 11 */}
                    <section id="termination" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Your Right to Terminate</h3>
                                <p className="text-theme-secondary">
                                    You may stop using our service and delete your account at any time through the app settings
                                    or by contacting us.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Our Right to Terminate</h3>
                                <p className="text-theme-secondary mb-2">We may terminate or suspend your account for:</p>
                                <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                                    <li>Violation of these Terms</li>
                                    <li>Fraudulent or illegal activity</li>
                                    <li>Extended period of inactivity</li>
                                    <li>Business or technical reasons</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Effect of Termination</h3>
                                <p className="text-theme-secondary">
                                    Upon termination, your right to use the service ceases immediately. We will delete your data
                                    according to our retention policies, and you may export your data before termination.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 12 */}
                    <section id="governing-law" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Jurisdiction</h3>
                                <p className="text-theme-secondary">
                                    These Terms shall be governed by and construed in accordance with the laws of Ethiopia.
                                    Any disputes shall be subject to the exclusive jurisdiction of Ethiopian courts.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Ethiopian Banking Laws</h3>
                                <p className="text-theme-secondary">
                                    Users are responsible for ensuring their use of Liq_Finance complies with Ethiopian banking
                                    regulations and foreign exchange laws.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 13 */}
                    <section id="changes" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
                        <p className="text-theme-secondary mb-4">
                            We may update these Terms from time to time. We will notify you of material changes by:
                        </p>
                        <ul className="list-disc list-inside text-theme-secondary space-y-1 text-sm">
                            <li>Posting the updated Terms on our website</li>
                            <li>Sending notifications through the app</li>
                            <li>Emailing registered users (for significant changes)</li>
                        </ul>
                        <p className="text-theme-secondary mt-4">
                            Your continued use of the service after changes constitutes acceptance of the new Terms.
                            If you disagree with changes, you may terminate your account.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section id="contact" className="bg-theme-card rounded-2xl p-6 border border-theme">
                        <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">General Inquiries</h3>
                                <p className="text-theme-secondary">
                                    Email: support@liqfinance.com<br />
                                    Address: Addis Ababa, Ethiopia
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Legal Notices</h3>
                                <p className="text-theme-secondary">
                                    Email: legal@liqfinance.com<br />
                                    For DMCA notices, data protection requests, and legal matters
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                                <p className="text-theme-secondary">
                                    Monday - Friday: 9:00 AM - 6:00 PM EAT<br />
                                    Saturday: 9:00 AM - 2:00 PM EAT<br />
                                    Sunday: Closed
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Back to App Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors"
                    >
                        Back to Liq_Finance
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TermsOfService