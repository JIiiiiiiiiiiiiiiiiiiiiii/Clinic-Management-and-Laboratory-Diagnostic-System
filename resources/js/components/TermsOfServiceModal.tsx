import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, CheckCircle, Scale } from 'lucide-react';

interface TermsOfServiceModalProps {
    open: boolean;
    onAccept: () => void;
    onClose: () => void;
}

export default function TermsOfServiceModal({ open, onAccept, onClose }: TermsOfServiceModalProps) {
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
                        <FileText className="h-6 w-6 text-green-600" />
                        Terms of Service
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Terms and Conditions for Use of SJHI Industrial Clinic Services
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
                                    These Terms of Service ("Terms") govern your use of SJHI Industrial Clinic's services, 
                                    including but not limited to appointment booking, medical consultations, laboratory services, 
                                    and related healthcare services. By accessing or using our services, you agree to be bound 
                                    by these Terms in accordance with the laws of the Republic of the Philippines.
                                </p>
                            </div>

                            {/* Acceptance of Terms */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">1. Acceptance of Terms</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    By accessing and using our services, you acknowledge that:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>You have read, understood, and agree to be bound by these Terms</li>
                                    <li>You are of legal age (18 years or older) or have parental/guardian consent</li>
                                    <li>You will provide accurate and complete information</li>
                                    <li>You will comply with all applicable laws and regulations</li>
                                    <li>We reserve the right to modify these Terms at any time, with notice provided</li>
                                </ul>
                            </div>

                            {/* Medical Services */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">2. Medical Services</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    Our medical services are provided in accordance with Philippine healthcare standards:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>All medical services are provided by licensed healthcare professionals</li>
                                    <li>We strive to provide accurate and reliable medical care</li>
                                    <li>Patients are responsible for providing accurate medical information</li>
                                    <li>Treatment plans are based on professional medical judgment</li>
                                    <li>Emergency situations should be directed to emergency services (911) immediately</li>
                                    <li>This platform is for non-emergency appointments only</li>
                                </ul>
                            </div>

                            {/* Appointments and Cancellations */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">3. Appointments and Cancellations</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    Appointment booking and cancellation policies:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Appointments must be scheduled in advance through our online system</li>
                                    <li>Appointment requests are subject to approval by clinic administration</li>
                                    <li>Cancellations should be made at least 24 hours in advance</li>
                                    <li>No-show fees may apply for missed appointments without prior notice</li>
                                    <li>We reserve the right to reschedule appointments when necessary</li>
                                    <li>Late arrivals may result in appointment rescheduling</li>
                                </ul>
                            </div>

                            {/* Payment and Billing */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">4. Payment and Billing</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    Payment terms and conditions:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Payment is due at the time of service unless other arrangements are made</li>
                                    <li>We accept cash, credit/debit cards, and HMO/insurance payments</li>
                                    <li>Prices are subject to change without prior notice</li>
                                    <li>Additional charges may apply for extra tests or procedures</li>
                                    <li>Late payment fees may apply to overdue accounts</li>
                                    <li>Refunds are subject to our refund policy and applicable laws</li>
                                </ul>
                            </div>

                            {/* Patient Responsibilities */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">5. Patient Responsibilities</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    As a patient, you are responsible for:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                    <li>Providing accurate and complete medical information</li>
                                    <li>Following medical advice and treatment plans provided by healthcare professionals</li>
                                    <li>Informing healthcare providers of any changes in your health condition</li>
                                    <li>Arriving on time for scheduled appointments</li>
                                    <li>Treating staff and other patients with respect and courtesy</li>
                                    <li>Complying with clinic policies and health protocols</li>
                                    <li>Making timely payments for services rendered</li>
                                </ul>
                            </div>

                            {/* Limitation of Liability */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">6. Limitation of Liability</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    To the fullest extent permitted by Philippine law, SJHI Industrial Clinic shall not be liable 
                                    for any indirect, incidental, special, consequential, or punitive damages arising from your use 
                                    of our services. Our total liability shall not exceed the amount you paid for the specific service 
                                    that gave rise to the claim. This limitation does not affect your rights under applicable consumer 
                                    protection laws.
                                </p>
                            </div>

                            {/* Intellectual Property */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">7. Intellectual Property</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    All content, including but not limited to text, graphics, logos, and software, on this platform 
                                    is the property of SJHI Industrial Clinic and is protected by Philippine copyright and trademark laws. 
                                    You may not reproduce, distribute, or use any content without our prior written consent.
                                </p>
                            </div>

                            {/* Governing Law */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">8. Governing Law and Jurisdiction</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    These Terms of Service shall be governed by and construed in accordance with the laws of the 
                                    Republic of the Philippines. Any disputes arising from these Terms or your use of our services 
                                    shall be subject to the exclusive jurisdiction of the courts of the Philippines.
                                </p>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">9. Contact Information</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    For questions or concerns regarding these Terms of Service, please contact us:
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
                                    <p><strong>Email:</strong> stjamesclinic413@gmail.com</p>
                                    <p><strong>Address:</strong> <a href="https://maps.app.goo.gl/du9rahz164nMFuaMA" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">View on Google Maps</a></p>
                                </div>
                            </div>

                            {/* Acknowledgment */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    <strong>By using our services, you acknowledge that you have read, understood, and agree to be 
                                    bound by these Terms of Service. If you do not agree to these Terms, please do not use our services.</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Agreement row - fixed at bottom */}
                    <div className="flex items-center gap-2 p-4 border-t bg-white flex-shrink-0">
                        <Checkbox
                            id="terms-checkbox"
                            checked={isAccepted}
                            onCheckedChange={(checked) => setIsAccepted(checked === true)}
                        />
                        <label
                            htmlFor="terms-checkbox"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                        >
                            <span>I have read and understood the Terms of Service and agree to be bound by them</span>
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

