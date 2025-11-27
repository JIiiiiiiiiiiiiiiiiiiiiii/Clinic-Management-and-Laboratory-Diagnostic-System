import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, CheckCircle, FileText } from 'lucide-react';

interface PrivacyActModalProps {
    open: boolean;
    onAccept: () => void;
    onClose: () => void;
}

export default function PrivacyActModal({ open, onAccept, onClose }: PrivacyActModalProps) {
    const [isAccepted, setIsAccepted] = useState(false);

    const handleAccept = () => {
        if (isAccepted) {
            onAccept();
            setIsAccepted(false);
        }
    };

    const handleClose = () => {
        setIsAccepted(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[96vw] max-w-5xl md:max-w-6xl lg:max-w-7xl max-h-[92vh]" hideCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Shield className="h-6 w-6 text-green-600" />
                        Data Privacy Act of 2012 (Republic Act No. 10173)
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Privacy Notice and Consent for Personal Data Processing
                    </DialogDescription>
                </DialogHeader>

                {/* Bordered card container that holds scrollable content + agreement + footer */}
                <div className="rounded-md border mt-4 overflow-hidden flex flex-col max-h-[calc(92vh-200px)]">
                    {/* Scrollable content */}
                    <div className="overflow-y-auto overflow-x-hidden p-4 flex-1 min-h-0">
                        <div className="space-y-6 pr-2">
                            {/* Introduction */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">Introduction</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    In compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations, 
                                    SJHI Industrial Clinic ("we", "us", "our") is committed to protecting your personal information and ensuring your privacy rights.
                                </p>
                            </div>

                            {/* Personal Information Collected */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">1. Personal Information We Collect</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    We collect the following personal and sensitive personal information:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Personal identification information (name, date of birth, age, sex, nationality, civil status)</li>
                                    <li>Contact information (address, telephone number, mobile number, email address)</li>
                                    <li>Medical and health information (medical history, allergies, current medications, treatment records)</li>
                                    <li>Financial information (payment details, insurance information, HMO details)</li>
                                    <li>Emergency contact information</li>
                                    <li>Other information necessary for providing healthcare services</li>
                                </ul>
                            </div>

                            {/* Purpose of Collection */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">2. Purpose of Collection and Processing</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    Your personal information is collected and processed for the following purposes:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Providing medical care, diagnosis, and treatment</li>
                                    <li>Scheduling and managing appointments</li>
                                    <li>Processing payments and insurance claims</li>
                                    <li>Maintaining medical records as required by law</li>
                                    <li>Communicating with you about your health and appointments</li>
                                    <li>Complying with legal and regulatory requirements</li>
                                    <li>Improving our services and patient care</li>
                                    <li>Conducting research and statistical analysis (with anonymization where applicable)</li>
                                </ul>
                            </div>

                            {/* Data Sharing */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">3. Sharing and Disclosure of Information</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    We may share your personal information only in the following circumstances:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>With your explicit consent</li>
                                    <li>With healthcare providers involved in your treatment</li>
                                    <li>With insurance companies or HMO providers for claims processing</li>
                                    <li>When required by law, court order, or government regulation</li>
                                    <li>In emergency situations to protect your health and safety</li>
                                    <li>With service providers who assist us in operating our clinic (under strict confidentiality agreements)</li>
                                </ul>
                                <p className="text-sm text-gray-700 leading-relaxed mt-2">
                                    <strong>We do not sell your personal information to third parties.</strong>
                                </p>
                            </div>

                            {/* Data Security */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">4. Data Security Measures</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    We implement appropriate physical, technical, and organizational security measures to protect your personal information:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Encryption of sensitive data in transit and at rest</li>
                                    <li>Secure servers and databases with access controls</li>
                                    <li>Regular security audits and vulnerability assessments</li>
                                    <li>Staff training on data protection and confidentiality</li>
                                    <li>Restricted access to personal information on a need-to-know basis</li>
                                    <li>Regular backup and disaster recovery procedures</li>
                                </ul>
                            </div>

                            {/* Your Rights */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">5. Your Rights Under the Data Privacy Act</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    As a data subject, you have the following rights:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li><strong>Right to be informed:</strong> You have the right to know how your personal information is being processed</li>
                                    <li><strong>Right to access:</strong> You can request access to your personal and medical information</li>
                                    <li><strong>Right to object:</strong> You can object to the processing of your personal information</li>
                                    <li><strong>Right to erasure or blocking:</strong> You can request the deletion or blocking of your personal information under certain circumstances</li>
                                    <li><strong>Right to damages:</strong> You may claim damages for violations of your data privacy rights</li>
                                    <li><strong>Right to data portability:</strong> You can request a copy of your data in a structured format</li>
                                    <li><strong>Right to file a complaint:</strong> You can file a complaint with the National Privacy Commission</li>
                                </ul>
                            </div>

                            {/* Retention Period */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">6. Data Retention</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    We will retain your personal and medical information for as long as necessary to fulfill the purposes 
                                    for which it was collected, comply with legal obligations (including medical record retention requirements), 
                                    resolve disputes, and enforce our agreements. Medical records are typically retained for a minimum of 
                                    ten (10) years as required by Philippine law.
                                </p>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">7. Data Protection Officer</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    For any concerns, questions, or requests regarding your personal information, please contact our Data Protection Officer:
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
                                    <p><strong>Email:</strong> stjamesclinic413@gmail.com</p>
                                    <p><strong>Address:</strong> <a href="https://maps.app.goo.gl/du9rahz164nMFuaMA" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">View on Google Maps</a></p>
                                </div>
                            </div>

                            {/* Consent Statement */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    <strong>By providing your personal information and using our services, you acknowledge that you have read, 
                                    understood, and consent to the collection, use, and processing of your personal information as described 
                                    in this Privacy Notice, in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173).</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Agreement row - fixed at bottom */}
                    <div className="flex items-center gap-2 p-4 border-t bg-white flex-shrink-0">
                        <Checkbox
                            id="privacy-checkbox"
                            checked={isAccepted}
                            onCheckedChange={(checked) => setIsAccepted(checked === true)}
                        />
                        <label
                            htmlFor="privacy-checkbox"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                        >
                            <span>I have read and understood the Privacy Notice and consent to the processing of my personal information in accordance with the Data Privacy Act of 2012 (RA 10173)</span>
                        </label>
                    </div>

                    {/* Footer with button inside the card - fixed at bottom */}
                    <div className="p-4 border-t bg-white flex justify-end gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="w-full sm:w-auto"
                            size="lg"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={!isAccepted}
                            className="w-full sm:w-auto"
                            size="lg"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

