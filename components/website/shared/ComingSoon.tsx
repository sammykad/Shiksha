'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    UsersRound, Library, Building2, ClipboardCheck,
    Lightbulb, Users2, PencilRuler, Rocket, ArrowRight,
    Mail, Sparkles
} from 'lucide-react';
import Link from 'next/link';

const iconMap = {
    'UsersRound': UsersRound,
    'Library': Library,
    'Building2': Building2,
    'ClipboardCheck': ClipboardCheck,
    'Lightbulb': Lightbulb,
    'Users2': Users2,
    'PencilRuler': PencilRuler,
    'Rocket': Rocket
};

interface ComingSoonProps {
    title: string;
    description: string;
    badge: string;
    iconName: keyof typeof iconMap;
}

export default function ComingSoon({ title, description, badge, iconName }: ComingSoonProps) {
    const Icon = iconMap[iconName] || Rocket;
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px]" />
            </div>

            <div className="max-w-3xl mx-auto text-center relative z-10">
                <Badge variant="outline" className="mb-6 bg-white/50 backdrop-blur-sm border-primary/20 text-primary px-4 py-1">
                    <Icon className="size-3.5 mr-2" />
                    {badge}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                    {title} <br />
                    <span className="text-primary flex items-center justify-center gap-3">
                        Coming Soon <Sparkles className="size-8" />
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    {description} We're currently fine-tuning our specialized solution for this industry to ensure it meets the Shiksha Cloud standard of excellence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 group" asChild>
                        <Link href="/select-organization">
                            Get Early Access <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-8 bg-white/50 backdrop-blur-sm" asChild>
                        <Link href="/features">
                            Explore Features
                        </Link>
                    </Button>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center">
                    <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                        <Mail className="size-4" /> Want to be notified when we launch?
                    </p>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex h-11 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Button type="submit" className="rounded-full h-11 px-6">Notify Me</Button>
                    </div>
                </div>
            </div>

            {/* Floating Icons for context */}
            <div className="hidden lg:block absolute top-1/4 left-20 animate-bounce transition-all duration-1000">
                <div className="p-4 rounded-2xl bg-white shadow-xl border border-slate-100 rotate-12">
                    <Rocket className="size-6 text-primary" />
                </div>
            </div>
            <div className="hidden lg:block absolute bottom-1/4 right-20 animate-pulse delay-75 transition-all duration-1000">
                <div className="p-4 rounded-2xl bg-white shadow-xl border border-slate-100 -rotate-12">
                    <Icon className="size-6 text-blue-500" />
                </div>
            </div>
        </div>
    );
}
