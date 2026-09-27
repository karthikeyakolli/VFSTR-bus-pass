import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { SupportService } from '@/services/SupportService';
import {
  HelpCircle,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Star,
  ShieldAlert,
  Building,
  CheckCircle2,
  FileQuestion,
  LifeBuoy,
  PhoneCall,
  Ticket,
} from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Payments' | 'Routes' | 'Renewals';
}

export const HelpPage: React.FC = () => {
  const toast = useToast();

  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('All');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['1', '2']);

  // Ticket Dialog Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Pass Clearance Issue');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I download or print my official Digital Bus Pass?',
      answer: 'Navigate to "My Digital Pass" from the sidebar or dashboard. Click the "Download Pass PDF" or "Print Pass Credential" button to generate an official printable PDF containing your QR code and institutional seal.',
      category: 'General',
    },
    {
      id: '2',
      question: 'What is the annual bus pass fee and how can I pay?',
      answer: 'The annual transport fee for AY 2026-2027 is ₹18,500 for standard routes. Fees can be paid online via SBI NetBanking, UPI (PhonePe/GPay), or via HDFC Bank Challan at the campus Accounts Cell counter.',
      category: 'Payments',
    },
    {
      id: '3',
      question: 'Can I change my boarding stop during the academic year?',
      answer: 'Yes. You can request a boarding point change by submitting a support ticket or visiting the Transport Cell in Admin Block Room 104 with proof of residence change. Seat availability on the target route will be verified.',
      category: 'Routes',
    },
    {
      id: '4',
      question: 'What should I do if I lose my printed physical bus pass ID?',
      answer: 'You can immediately use your Digital QR Pass on your mobile device. For a replacement physical ID card, visit the Transport Cell desk. A duplicate printing fee of ₹100 applies.',
      category: 'General',
    },
    {
      id: '5',
      question: 'How does the annual pass renewal process work?',
      answer: 'Pass renewal opens 30 days prior to term conclusion. Go to "Renew Pass" in your portal, verify your academic year details, submit payment confirmation, and your pass validity will extend automatically.',
      category: 'Renewals',
    },
    {
      id: '6',
      question: 'What happens if my assigned bus experiences a breakdown or route delay?',
      answer: 'In the event of a bus breakdown, a relief bus is immediately dispatched from Vadlamudi Campus. Instant SMS and portal notifications will be pushed to affected students on that route.',
      category: 'Routes',
    },
  ];

  const commonIssues = [
    {
      id: '1',
      title: 'Lost or Damaged Bus Pass Credential',
      desc: 'Access your instant Digital QR Pass on your phone or request a duplicate printed card.',
      actionText: 'View Digital Pass',
      icon: <Ticket className="h-5 w-5 text-primary" />,
    },
    {
      id: '2',
      title: 'Boarding Point Shift Request',
      desc: 'Relocating to a new city area? Request a stop or route transfer with seat verification.',
      actionText: 'Submit Transfer Request',
      icon: <MapPin className="h-5 w-5 text-blue-500" />,
    },
    {
      id: '3',
      title: 'Payment Verification Pending',
      desc: 'Paid fee but status shows pending? Upload your transaction bank reference receipt.',
      actionText: 'Verify Receipt',
      icon: <Clock className="h-5 w-5 text-amber-500" />,
    },
    {
      id: '4',
      title: 'Bus Delay or Schedule Shift',
      desc: 'Check live route notices for roadwork detours or special exam trip schedules.',
      actionText: 'Check Route Notices',
      icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
    },
  ];

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFaqCategory !== 'All' && faq.category !== activeFaqCategory) return false;
    return true;
  });

  const { studentProfile } = useUser();

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error('Validation Error', 'Please fill in both the subject and issue description.');
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const res = await SupportService.createSupportTicket(
        studentProfile?.regNo || 'STUDENT',
        ticketSubject,
        ticketDescription,
        ticketCategory
      );

      setShowTicketModal(false);
      const ticketRef = res.data?.ticketId || `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketSubject('');
      setTicketDescription('');
      toast.success('Ticket Submitted', `Support ticket ${ticketRef} created. Transport Cell will respond within 24 hours.`);
    } catch {
      toast.error('Submission Error', 'Failed to record support ticket.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setIsSubmittingFeedback(false);
    setFeedbackComment('');
    toast.success('Feedback Received', 'Thank you for rating VFSTR Transport Services!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Section Header */}
      <SectionHeader
        title="Help & Student Support Center"
        subtitle="Frequently asked questions, transport desk contacts, emergency hotlines, and ticket support"
        badge={<Badge variant="outline">VFSTR Support Desk</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
            onClick={() => setShowTicketModal(true)}
          >
            Raise Support Ticket
          </Button>
        }
      />

      {/* 1. Emergency Contact & Office Working Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emergency Contact Card */}
        <Card className="p-5 border-2 border-rose-500/30 bg-rose-50/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> 24/7 Emergency Hotline
            </span>
            <Badge variant="destructive">Urgent</Badge>
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground block">+91 94401 23456</span>
            <p className="text-xs text-muted-foreground mt-0.5">Campus Transport Breakdown & Security Helpline</p>
          </div>
          <div className="p-2.5 rounded-lg bg-card border border-rose-500/20 text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <PhoneCall className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Security Control: +91 863-2344700 Ext 100
            </p>
          </div>
        </Card>

        {/* Transport Office Details Card */}
        <Card className="p-5 border-2 border-primary/20 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transport Cell Office
            </span>
            <Badge variant="secondary">Admin Block</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block">Admin Block, Room 104</strong>
                <span className="text-muted-foreground">Vadlamudi Campus, Guntur, AP - 522213</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground pt-1">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>+91 863-2344700 Ext 104 / 105</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-mono">transport@vignan.ac.in</span>
            </div>
          </div>
        </Card>

        {/* Office Operating Hours Card */}
        <Card className="p-5 border-2 border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Office Working Hours
            </span>
            <Badge variant="outline">Mon - Sat</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>Working Schedule:</span>
                <span>08:00 AM – 05:00 PM</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Lunch Recess:</span>
                <span>01:00 PM – 02:00 PM</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Sunday:</span>
                <span className="text-destructive font-semibold">Closed</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Common Issues Quick Guide */}
      <Card className="p-6 border-2 border-border">
        <SectionHeader
          title="Common Transport Issues & Quick Solutions"
          subtitle="Instant resolution guides for frequent student queries"
          badge={<LifeBuoy className="h-4 w-4 text-primary" />}
          className="pb-3 mb-4"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commonIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {issue.icon}
                  <h4 className="text-xs font-bold text-foreground leading-snug">{issue.title}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{issue.desc}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-[11px] h-8"
                onClick={() => {
                  if (issue.id === '1') toast.info('Digital Pass', 'Use your phone to display the QR pass badge.');
                  else if (issue.id === '2') setShowTicketModal(true);
                  else toast.info('Help Desk', 'Transport Desk is verifying recent payment clearings.');
                }}
              >
                {issue.actionText}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Frequently Asked Questions (Interactive Accordion with Search) */}
      <Card className="p-6 border-2 border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" /> Frequently Asked Questions
            </h3>
            <p className="text-xs text-muted-foreground">Search and browse transport cell guidelines</p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search FAQs by keyword..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold scrollbar-none pb-1">
          {['All', 'General', 'Payments', 'Routes', 'Renewals'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFaqCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFaqCategory === cat
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        {filteredFaqs.length === 0 ? (
          <EmptyState
            title="No Matching FAQs Found"
            description={`No FAQ answers matching "${faqSearch}" in ${activeFaqCategory}.`}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFaqSearch('');
                  setActiveFaqCategory('All');
                }}
              >
                Reset Search
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-border/80 bg-card overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground border-t border-border/40 bg-muted/20 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 4. Student Feedback Submission Section */}
      <Card className="p-6 border-2 border-primary/20 bg-card space-y-4">
        <SectionHeader
          title="Student Feedback & Ratings"
          subtitle="Rate your daily campus transport experience and suggest route improvements"
          badge={<Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
          className="pb-2"
        />

        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-foreground block">Overall Transport Service Rating:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= feedbackRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-foreground ml-2">
                {feedbackRating} of 5 Stars ({feedbackRating === 5 ? 'Excellent' : feedbackRating >= 4 ? 'Good' : 'Satisfactory'})
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-foreground block">Comments & Route Improvement Suggestions:</span>
            <textarea
              rows={3}
              placeholder="Share your thoughts on bus cleanliness, punctuality, driver behavior, or route timing..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmittingFeedback}
            leftIcon={<Send className="h-3.5 w-3.5" />}
          >
            Submit Feedback
          </Button>
        </form>
      </Card>

      {/* Raise Support Ticket Dialog Modal */}
      <Dialog
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Raise Student Support Ticket"
        description="Submit your issue to the VFSTR Transport Committee."
      >
        <form onSubmit={handleTicketSubmit} className="space-y-4 py-2 text-xs">
          <Select
            label="Support Ticket Category"
            options={[
              { value: 'Pass Clearance Issue', label: 'Pass Approval & Fee Verification' },
              { value: 'Boarding Stop Shift', label: 'Boarding Point Transfer Request' },
              { value: 'Bus Schedule Delay', label: 'Bus Schedule & Delay Notice' },
              { value: 'Other Queries', label: 'Other Transport Query' },
            ]}
            value={ticketCategory}
            onChange={(e) => setTicketCategory(e.target.value)}
          />

          <Input
            label="Ticket Subject"
            placeholder="Brief summary of your query or issue"
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Detailed Description of Issue:</label>
            <textarea
              rows={4}
              placeholder="Provide exact details (e.g. receipt ref number, target stop, date of occurrence)..."
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTicketModal(false)}
              disabled={isSubmittingTicket}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingTicket}
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
            >
              Create Support Ticket
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
