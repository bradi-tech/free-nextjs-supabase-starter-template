import React from 'react';

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                        If you do not agree to abide by the above, please do not use this service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</li>
                        <li>This is the grant of a license, not a transfer of title.</li>
                        <li>This license shall automatically terminate if you violate any of these restrictions.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
                    <p className="mb-4">When creating an account, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate and complete information</li>
                        <li>Maintain and update your information</li>
                        <li>Keep your password secure</li>
                        <li>Be responsible for all activities under your account</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Disclaimer</h2>
                    <p>
                        The materials on this website are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied,
                        and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions
                        of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Limitations</h2>
                    <p>
                        In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss
                        of data or profit, or due to business interruption) arising out of the use or inability to use the materials on
                        our website.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Revisions and Errata</h2>
                    <p>
                        The materials appearing on our website could include technical, typographical, or photographic errors. We do not
                        warrant that any of the materials on our website are accurate, complete, or current.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit
                        to the exclusive jurisdiction of the courts in that location.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us at:
                        <br />
                        Email: legal@example.com
                        <br />
                        Address: 123 Legal Avenue, Terms City, 12345
                    </p>
                </section>

                <section>
                    <p className="text-sm text-gray-600">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </section>
            </div>
        </div>
    );
}
