import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, CheckCircle } from 'lucide-react';

interface TermsAndConditionsModalProps {
    open: boolean;
    onAccept: () => void;
    formType?: 'online' | 'walkin' | 'transfer';
    storageKey?: string;
}

const getTermsContent = (formType?: string) => {
    const baseTerms = {
        title: "Terms and Conditions",
        subtitle: "Please read and accept the following terms before proceeding",
        sections: [
            {
                title: "1. Information Accuracy",
                content: "I understand that I must provide accurate and complete information. Any false or misleading information may result in the rejection of my appointment request or registration."
            },
            {
                title: "2. Data Privacy",
                content: "I acknowledge that my personal and medical information will be collected, stored, and used in accordance with the clinic's privacy policy and applicable data protection laws. My information will be kept confidential and used solely for medical purposes."
            },
            {
                title: "3. Appointment Booking",
                content: "For online appointments, I understand that my appointment request is subject to admin approval. The clinic reserves the right to accept, modify, or decline any appointment request. I will be notified of the approval status via the provided contact information."
            },
            {
                title: "4. Cancellation Policy",
                content: "I understand that if I need to cancel or reschedule my appointment, I must notify the clinic at least 24 hours in advance. Failure to do so may result in charges or restrictions on future bookings."
            },
            {
                title: "5. Medical Services",
                content: "I acknowledge that the clinic will provide medical services as deemed appropriate by the attending physician. Treatment plans and recommendations will be based on my medical condition and professional medical judgment."
            },
            {
                title: "6. Payment Terms",
                content: "I understand that payment is required at the time of service unless other arrangements have been made. Prices may vary based on the type of service and any additional tests or procedures that may be necessary."
            },
            {
                title: "7. Consent for Treatment",
                content: "By proceeding, I consent to receive medical treatment as recommended by the clinic's healthcare providers. I understand that I have the right to refuse any treatment and to seek a second opinion."
            },
            {
                title: "8. Emergency Situations",
                content: "I understand that in case of a medical emergency, I should call emergency services immediately rather than relying on appointment booking. This form is for non-emergency appointments only."
            },
            {
                title: "9. Compliance",
                content: "I agree to comply with all clinic policies, including arrival times, behavior standards, and any health and safety protocols in place at the facility."
            },
            {
                title: "10. Acknowledgment",
                content: "I acknowledge that I have read, understood, and agree to these terms and conditions. I am providing this information voluntarily and understand my rights regarding my medical information."
            }
        ]
    };

    if (formType === 'transfer') {
        baseTerms.sections.push({
            title: "11. Patient Transfer",
            content: "I understand that this registration is for patient transfer purposes. All transfer documentation and medical records will be handled according to established protocols and legal requirements."
        });
    }

    return baseTerms;
};

export default function TermsAndConditionsModal({ open, onAccept, formType, storageKey }: TermsAndConditionsModalProps) {
    const [isAccepted, setIsAccepted] = useState(false);
    const terms = getTermsContent(formType);

    const handleAccept = () => {
        if (isAccepted) {
            // Store acceptance in sessionStorage (scoped by provided storageKey when available)
            const key = storageKey || `terms_accepted_${formType || 'default'}`;
            sessionStorage.setItem(key, 'true');
            onAccept();
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent className="w-[96vw] max-w-5xl md:max-w-6xl lg:max-w-7xl max-h-[92vh]" hideCloseButton={true}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <FileText className="h-6 w-6" />
                        {terms.title}
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        {terms.subtitle}
                    </DialogDescription>
                </DialogHeader>

                {/* Bordered card container that holds scrollable content + agreement + footer */}
                <div className="rounded-md border mt-4 overflow-hidden flex flex-col max-h-[calc(92vh-200px)]">
                    {/* Scrollable content */}
                    <div className="overflow-y-auto overflow-x-hidden p-4 flex-1 min-h-0">
                        <div className="space-y-6 pr-2">
                            {terms.sections.map((section, index) => (
                                <div key={index} className="space-y-2">
                                    <h3 className="font-semibold text-lg text-gray-900">{section.title}</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
                                </div>
                            ))}
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
                            <span>I have read and agree to the Terms and Conditions</span>
                        </label>
                    </div>

                    {/* Footer with button inside the card - fixed at bottom */}
                    <div className="p-4 border-t bg-white flex justify-end flex-shrink-0">
                        <Button
                            onClick={handleAccept}
                            disabled={!isAccepted}
                            className="w-full sm:w-auto"
                            size="lg"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
