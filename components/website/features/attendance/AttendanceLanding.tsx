import AttendanceTracker from "@/components/website/features/attendance/AttendanceTracker";
import { CheckCircle2, Clock, Smartphone, Zap, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export default function AttendanceLanding() {
    return (
        <div className="min-h-screen bg-[#f8f8f6]">

            {/* 1. Hero */}
            <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">

                    <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-7">
                        <Zap className="w-3.5 h-3.5 text-[#7fb800]" strokeWidth={2} />
                        <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                            Go Live in 24 Hours
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl mx-auto">
                        School Attendance System — The{" "}
                        <span className="relative inline-block">
                            2-Tap
                            <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#d9f972] -z-10 block" />
                        </span>
                        {" "}Revolution
                    </h1>

                    <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                        Stop wasting 20 minutes on paper registers. Save 2.5 hours daily per teacher
                        with real-time sync to parents and automated school records.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
                        <Link
                            href="/select-organization"
                            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
                        >
                            Book a 10-Min Demo
                        </Link>
                        <Link
                            href="/pricing"
                            className="w-full sm:w-auto bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium px-8 py-3.5 rounded-full text-sm transition-colors"
                        >
                            View Pricing — ₹79/student
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. Interactive Preview */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-4">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={1} />
                            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                                Interactive Preview
                            </span>
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
                            Experience the Workflow
                        </h2>
                    </div>
                    <AttendanceTracker />
                </div>
            </section>

            {/* 3. Benefits Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                            The Frictionless Digital Upgrade
                        </h2>
                        <p className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
                            Everything your school needs to go paperless — today.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                icon: Clock,
                                title: "Lightning-Fast Log",
                                description: "Tap. Tap. Done. Mark attendance for 60 students in under 10 seconds.",
                                impact: "Save 20 min/day",
                            },
                            {
                                icon: Smartphone,
                                title: "Instant Trust Loop",
                                description: "Parents know instantly via WhatsApp. Eliminate confusion and build 100% transparency.",
                                impact: "80% fewer queries",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Audit-Proof Data",
                                description: "Govt-compliant reports on demand. No more end-of-month tallying nightmares.",
                                impact: "100% compliant",
                            },
                            {
                                icon: Zap,
                                title: "Hardware-Free Start",
                                description: "Forget expensive biometric machines. Works beautifully on any teacher's phone.",
                                impact: "₹0 setup cost",
                            },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="group relative bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col hover:border-neutral-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center mb-5 group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
                                            <Icon className="w-[18px] h-[18px] text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                                        </div>
                                        <h3 className="text-base font-semibold tracking-tight text-neutral-900 mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 leading-relaxed flex-1 mt-2">
                                            {item.description}
                                        </p>
                                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-neutral-400" strokeWidth={2} />
                                            <span className="text-xs font-semibold text-neutral-500">{item.impact}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. Testimonials */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A3CD39]" />
                            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Trusted by Schools</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                            What Schools Say About 2-Tap Attendance
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "We save 25 minutes every single morning. Teachers love it.",
                                name: "Mrs. Sunita Reddy",
                                role: "Principal, KV No. 1 Hyderabad",
                            },
                            {
                                quote: "Parent queries about attendance dropped 80% after WhatsApp alerts started.",
                                name: "P.K. Sharma",
                                role: "Admin Head, Ryan International",
                            },
                            {
                                quote: "From paper registers to digital in one day. Zero training needed.",
                                name: "Anjali Mehta",
                                role: "Academic Head, DPS Bengaluru",
                            },
                        ].map(t => (
                            <div key={t.name} className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                                    ))}
                                </div>
                                <p className="text-sm text-neutral-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <p className="text-xs font-semibold text-neutral-900">{t.name}</p>
                                    <p className="text-[10px] text-neutral-400">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Why Shiksha Cloud */}
            <section className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-neutral-900 rounded-3xl px-10 py-14 relative overflow-hidden">
                        {/* Grid texture */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem]" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-7">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
                                    <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">Why Shiksha Cloud</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
                                    Designed for the Indian Classroom
                                </h2>
                                <p className="text-white/50 text-base leading-relaxed mb-8">
                                    We know your teachers aren't IT experts. That's why we built Shiksha Cloud
                                    to be as easy as WhatsApp — if they can send a message, they can use this.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Works on basic 3G/4G connections",
                                        "No hardware investment required",
                                        "Support for 50+ year old teachers",
                                        "99% Parent Satisfaction rate",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                                            </div>
                                            <span className="text-sm text-white/80 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">Real Impact in Numbers</p>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { value: "92%", label: "Faster data access" },
                                        { value: "20+ min", label: "Saved daily per teacher" },
                                        { value: "80%", label: "Fewer parent queries" },
                                        { value: "₹0", label: "Setup fees" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-white/5 rounded-2xl p-4">
                                            <div className="text-3xl font-bold text-[#d9f972] tracking-tight">{stat.value}</div>
                                            <div className="text-xs text-white/40 mt-1 font-medium">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// No Give me Give Component for Attendance aslo im using this as per shiksha.cloud attendacne module so make it nicly with this design insprations