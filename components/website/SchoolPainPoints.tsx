import { ArrowRight, BarChart2, FileText, RotateCcw, Clock, Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const painPoints = [
    {
        id: 1,
        icon: BarChart2,
        title: "Too much manual re-entry",
        description:
            "Staff write attendance in registers, log fees in Excel, then re-enter the same data into multiple places. Hours lost every day.",
    },
    {
        id: 2,
        icon: FileText,
        title: "Data that never matches",
        description:
            "Attendance registers, fee ledgers, and office sheets tell three different stories. Confusion, disputes, and wasted hours trying to reconcile.",
    },
    {
        id: 3,
        icon: RotateCcw,
        title: "Rebuilding from scratch yearly",
        description:
            "New academic year means new registers, re-entering every student, rebuilding fee structures. The same exhausting work, every year.",
    },
    {
        id: 4,
        icon: Clock,
        title: "Teachers doing admin instead of teaching",
        description:
            "Writing attendance registers, generating reports, chasing payments — teachers spend more time on paperwork than on students.",
    },
    {
        id: 5,
        icon: Users,
        title: "Growth creates more chaos",
        description:
            "More students means more files, more confusion, and zero visibility across classrooms or branches. Scaling feels impossible.",
    },
    {
        id: 6,
        icon: MessageCircle,
        title: "Parents always out of the loop",
        description:
            "Notices get lost, parents miss fee deadlines, teachers and office give inconsistent answers. Trust erodes slowly — then all at once.",
    },
];

export default function SchoolPainPoints() {
    return (
        <section className="py-24 bg-white dark:bg-neutral-950">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                        Why schools switch
                    </span>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4 leading-snug">
                        Daily operations are{" "}
                        <span className="text-red-500 dark:text-red-400">
                            costing you time
                        </span>{" "}
                        you don't have
                    </h2>
                    <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Manual work, scattered data, and miscommunication quietly drain your
                        school every day. Here's what principals and admins tell us — and
                        how{" "}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                            Shiksha Cloud
                        </span>{" "}
                        fixes it.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-neutral-800 border border-slate-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
                    {painPoints.map((item, index) => {
                        const isBottomRow = index >= 3;
                        return (
                            <PainPointItem
                                key={item.id}
                                item={item}
                                showTopDivider={isBottomRow}
                            />
                        );
                    })}
                </div>

                {/* Closing bar */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                        <span className="font-medium text-slate-800 dark:text-white">
                            Shiksha Cloud
                        </span>{" "}
                        turns every one of these into an automated, 2-tap workflow.
                    </p>
                    <Link
                        href="/select-organization"
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline shrink-0"
                    >
                        See how it works
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
}

function PainPointItem({
    item,
    showTopDivider,
}: {
    item: (typeof painPoints)[0];
    showTopDivider: boolean;
}) {
    return (
        <div
            className={`group flex flex-col gap-3 px-6 py-7 bg-white dark:bg-neutral-950 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors duration-200 ${showTopDivider
                    ? "border-t border-slate-100 dark:border-neutral-800 md:border-t-0"
                    : ""
                }`}
        >
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 stroke-[1.75]" />
            </div>

            {/* Text */}
            <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1.5 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {item.title}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                </p>
            </div>
        </div>
    );
}