import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/layouts/components/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  Bus,
  ShieldCheck,
  CreditCard,
  QrCode,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  Mail,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  Calendar,
  FileCheck,
  Building,
  Award,
  Compass,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { UserCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { isAuthenticated } = useAuth();
  const { studentProfile } = useUser();

  const stats = [
    { title: 'Active Bus Routes', value: '48+', description: 'Connecting Guntur, Vijayawada, Tenali & Ongole', icon: <MapPin className="h-5 w-5 text-primary" /> },
    { title: 'Daily Commuters', value: '3,850+', description: 'Students & Faculty transported safely', icon: <GraduationCap className="h-5 w-5 text-primary" /> },
    { title: 'Fleet Buses', value: '65+', description: 'GPS-monitored campus fleet', icon: <Bus className="h-5 w-5 text-primary" /> },
    { title: 'Schedule Reliability', value: '99.2%', description: 'On-time morning & evening dispatch', icon: <Clock className="h-5 w-5 text-primary" /> },
  ];

  const studentBenefits = [
    {
      title: 'Digital Pass Credential',
      description: 'Instant encrypted QR code bus pass accessible anytime on your smartphone without physical paper hassle.',
      icon: <QrCode className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Online Fee Payment',
      description: 'Direct institutional payment integration with SBI Collect & NetBanking with immediate receipt clearance.',
      icon: <CreditCard className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Live Route Timetables',
      description: 'Clear visibility into pickup stop locations, morning arrival timings, and evening return schedules.',
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Instant Annual Renewal',
      description: 'Single-click renewal process for upcoming academic terms with seat preference reservation.',
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    },
  ];

  const comparison = [
    { feature: 'Pass Format', legacy: 'Physical laminated paper pass', digital: 'Encrypted Digital Pass with QR Code' },
    { feature: 'Application Process', legacy: 'Manual paper form submitting at office', digital: 'Instant 100% online application portal' },
    { feature: 'Verification', legacy: 'Manual visual inspection by driver', digital: 'Instant QR scanner audit by transport desk' },
    { feature: 'Lost Pass Recovery', legacy: 'Duplicate fee penalty + 3 days wait', digital: 'Instant download anytime on student portal' },
    { feature: 'Payment Verification', legacy: 'Physical fee receipt submission', digital: 'Automated digital verification with receipt' },
  ];

  const processSteps = [
    { step: '01', title: 'Login', description: 'Access the portal using your official VFSTR student credentials or roll number.', icon: <GraduationCap className="h-5 w-5" /> },
    { step: '02', title: 'Transport Status', description: 'Check your current enrollment status or view available bus routes across AP.', icon: <Compass className="h-5 w-5" /> },
    { step: '03', title: 'Apply / Manage Pass', description: 'Submit a new pass application or manage your existing route allocation.', icon: <FileCheck className="h-5 w-5" /> },
    { step: '04', title: 'Payment', description: 'Clear annual transport fees securely via integrated university payment gateways.', icon: <CreditCard className="h-5 w-5" /> },
    { step: '05', title: 'Travel', description: 'Show your active digital QR bus pass on your phone to board campus buses daily.', icon: <Bus className="h-5 w-5" /> },
  ];

  const campusHighlights = [
    { title: 'Vadlamudi Main Campus Bay', desc: 'Centralized 65-bus transport terminal equipped with shaded boarding bays and student waiting lounges.', tag: 'Main Terminal' },
    { title: 'GPS Fleet Operations', desc: 'Real-time telemetry and schedule monitoring ensuring safe and on-time daily student transit.', tag: 'Safety First' },
    { title: 'Dedicated Finance Desk', desc: 'Direct Transport & Accounts Cell support located at Admin Block Room 104 for instant query resolution.', tag: 'Student Support' },
  ];

  const faqs = [
    {
      q: 'Who is eligible for VFSTR bus pass application?',
      a: 'All enrolled undergraduate, postgraduate, and Ph.D. students of VFSTR Vadlamudi campus, as well as university faculty and staff members, are eligible.',
    },
    {
      q: 'How do I present my bus pass during daily boarding?',
      a: 'Simply open the "My Digital Pass" screen on your mobile device and present the digital QR code pass to the bus conductor or transport coordinator.',
    },
    {
      q: 'What should I do if I change my residential pickup point?',
      a: 'Submit a route modification request through your Student Portal settings. If there is a fee tier difference, the transport desk will guide the adjustment.',
    },
    {
      q: 'Can I request a refund if I discontinue transport mid-semester?',
      a: 'Refunds and cancellations are processed as per the official VFSTR Transport Cell Policy published at the start of each academic year.',
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-6">
      {/* 1. Hero Banner with Campus Image Placeholder */}
      <section className="relative overflow-hidden pt-4 pb-8">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Text Content */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <Badge variant="secondary" className="w-fit text-xs font-semibold px-3 py-1">
                Official Transport Portal • VFSTR Vadlamudi Campus
              </Badge>

              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-primary border border-sky-200 dark:border-sky-800 text-xs font-bold">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Authenticated Student Session Active</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                    Welcome back, <span className="text-primary">{studentProfile.name}</span>!
                  </h1>
                  <div className="p-4 rounded-xl bg-card border-2 border-primary/20 shadow-sm space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">Register Roll No:</span>{' '}
                        <span className="font-mono text-primary font-bold">{studentProfile.regNo}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Academic Section:</span>{' '}
                        <span className="font-medium text-foreground">{studentProfile.section}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">College Email:</span>{' '}
                        <span className="font-medium text-foreground">{studentProfile.email}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Department:</span>{' '}
                        <span className="font-medium text-foreground">{studentProfile.department}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                    VFSTR Smart Transport <span className="text-primary">Management System</span>
                  </h1>

                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    Digitizing the university commuting experience for Vignan Foundation for Science, Technology & Research. Seamlessly apply for annual bus passes, view route timetables, and manage fee clearings.
                  </p>
                </>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/student">
                      <Button size="lg" leftIcon={<GraduationCap className="h-5 w-5" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Go to My Student Portal
                      </Button>
                    </Link>
                    <Link to="/student/profile">
                      <Button variant="outline" size="lg" leftIcon={<UserCheck className="h-5 w-5" />}>
                        My Profile Details
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg" leftIcon={<GraduationCap className="h-5 w-5" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Student Login
                      </Button>
                    </Link>
                    <Link to="/routes">
                      <Button variant="outline" size="lg" leftIcon={<Compass className="h-5 w-5" />}>
                        Learn More & Routes
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground border-t border-border">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Digital QR Pass
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> SBI ERP Payments
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 65+ Deluxe Fleet
                </span>
              </div>
            </div>

            {/* Hero Campus Image & Pass Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <Card className="w-full max-w-md border border-white/20 dark:border-slate-800 bg-card/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden space-y-4 rounded-3xl hover:shadow-primary/10 hover:shadow-2xl transition-all duration-300">
                {/* Large Campus Image Graphic Banner */}
                <div className="h-48 w-full rounded-2xl border border-border/80 flex flex-col items-center justify-end p-4 text-center relative overflow-hidden group">
                  <img src="/VFSTR-bus-pass/hero_bus.png" alt="VFSTR Campus Bus" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10" />
                  <div className="z-20 text-white space-y-1">
                    <span className="text-xs font-black uppercase tracking-wider block drop-shadow-md">Vadlamudi Main Campus Terminal</span>
                    <span className="text-[11px] text-white/90 font-medium block">Vignan Foundation for Science, Technology & Research</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground tracking-wide">VFSTR DIGITAL BUS PASS</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {isAuthenticated ? studentProfile.name : 'Academic Year 2026 - 2027'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isAuthenticated ? 'secondary' : 'success'} dot className="px-2.5 py-0.5 font-bold">
                    {isAuthenticated ? studentProfile.regNo : 'Active'}
                  </Badge>
                </div>

                {/* QR Code Graphic Placeholder */}
                <div className="flex flex-col items-center justify-center p-4 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/80">
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white border border-slate-200 p-2 shadow-md hover:scale-105 transition-transform">
                    <QrCode className="h-20 w-20 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground mt-2 tracking-wider">
                    PASS ID: VFSTR-2026-{studentProfile.regNo}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Transport Statistics Bar */}
      <section className="py-2">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 3. About VFSTR Transport Services */}
      <section className="py-8 bg-muted/20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <Badge variant="secondary">About VFSTR Transport</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Serving 3,850+ Commuters Across Coastal Andhra Pradesh
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The VFSTR Transport Cell operates one of the largest dedicated university bus fleets in the region, connecting Guntur, Vijayawada, Tenali, Ponnur, Mangalagiri, and surrounding rural districts directly to Vadlamudi Campus.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <strong className="text-foreground block font-bold text-sm">65+ Fleet Buses</strong>
                  <span className="text-muted-foreground">Maintained to high safety standards</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <strong className="text-foreground block font-bold text-sm">48+ Active Routes</strong>
                  <span className="text-muted-foreground font-medium">Covering major urban & rural stops</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Card className="p-6 border-2 border-primary/20 bg-card space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Official University Operating Standards
                </h3>
                <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Fixed morning arrival at 07:50 AM guaranteeing students reach classes prior to 08:00 AM lectures.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Dual evening departures (05:15 PM regular and 06:30 PM extended shift for library & lab scholars).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Experienced university drivers with mandatory annual safety certifications and background checks.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Why Smart Transport Management */}
      <section className="py-8">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Why Smart Transport Management?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Replacing legacy manual paper cards with digital efficiency for students and administrators.
            </p>
          </div>

          <Card className="overflow-hidden border-2 border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 border-b border-border text-foreground font-semibold">
                    <tr>
                      <th className="p-4 w-1/3">System Feature</th>
                      <th className="p-4 w-1/3 text-rose-600 dark:text-rose-400">Legacy Paper System</th>
                      <th className="p-4 w-1/3 text-emerald-600 dark:text-emerald-400">VFSTR Digital System</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparison.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{row.feature}</td>
                        <td className="p-4 text-muted-foreground flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>{row.legacy}</span>
                        </td>
                        <td className="p-4 text-foreground font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{row.digital}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* 5. Student Benefits */}
      <section className="py-8 bg-muted/20">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Student Benefits
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Designed specifically to simplify daily university transport access for VFSTR students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentBenefits.map((benefit, idx) => (
              <Card key={idx} className="p-6 flex flex-col gap-3 hover:border-primary/40 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-1">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-bold text-foreground">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Simple Process Flow */}
      <section className="py-8">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              4-Step Application Process
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From online student login to active digital pass generation in under 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {processSteps.map((step, idx) => (
              <Card key={idx} className="p-6 relative flex flex-col gap-3 border-2 border-border">
                <span className="text-xs font-extrabold text-primary tracking-widest">{step.step}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. Campus Highlights */}
      <section className="py-8 bg-muted/20">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Vadlamudi Campus Transport Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              State-of-the-art transport bays and institutional coordination for daily commuters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campusHighlights.map((item, idx) => (
              <Card key={idx} className="p-6 space-y-3 border-2 border-border bg-card">
                <Badge variant="outline" className="text-[10px]">{item.tag}</Badge>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="py-8">
        <Container size="md">
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Common answers regarding bus pass applications, fee payments, and route timetables.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Card key={idx} className="overflow-hidden border border-border">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/50">
                      {faq.a}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 9. Transport Office Information & Login CTA */}
      <section className="py-10 bg-muted/30 border-t border-border">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <Badge variant="secondary" className="w-fit">Transport Office & Helpdesk</Badge>
              <h2 className="text-2xl font-bold text-foreground">VFSTR Transport Cell Office</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need physical assistance with route allocation or fee challans? Visit the Transport Cell office located on the Vadlamudi campus ground floor.
              </p>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">Admin Block, Room 104, Vadlamudi Campus, Guntur, AP - 522213</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">+91 863-2344700 • Ext: 104 / 105</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">transport@vignan.ac.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">Monday – Saturday: 08:00 AM – 05:00 PM</span>
                </div>
              </div>
            </div>

            {/* Login / Portal Call To Action Box */}
            <Card className="p-8 flex flex-col gap-5 border-2 border-primary/30 bg-card text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                {isAuthenticated ? (
                  <>
                    <Badge variant="secondary" className="text-[10px] font-mono mb-1">
                      {studentProfile.regNo} • {studentProfile.section}
                    </Badge>
                    <h3 className="text-xl font-extrabold text-foreground">{studentProfile.name}</h3>
                    <p className="text-xs text-muted-foreground">{studentProfile.email}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-extrabold text-foreground">Ready to Access Student Transport Portal?</h3>
                    <p className="text-xs text-muted-foreground">Log in with your VFSTR Roll Number or Email to view your active digital pass.</p>
                  </>
                )}
              </div>
              <Link to={isAuthenticated ? '/student' : '/login'} className="w-full">
                <Button size="lg" variant="primary" className="w-full font-bold" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {isAuthenticated ? 'Open My Student Dashboard' : 'Access Student Portal Login'}
                </Button>
              </Link>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
};

