import Link from 'next/link';
import { ArrowRight, Shield, Lock, Eye, FileText, Search, Clock, CheckCircle2, Info } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';

export default function page() {
  return (
    <main >
      {/* Page Header */}
      {/* <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Anonymous Complaints</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Submit or track a confidential workplace complaint</p>
          </div>
          <Badge variant="verified" className='whitespace-nowrap'> <span className='bg-green-500 animate-pulse w-2 h-2 rounded-full mr-2'></span>System Active</Badge>
        </div>
      </div> */}
      <PageHeader
        title="Anonymous Complaints"
        description="Submit or track a confidential workplace complaint"
        icon={Shield}
        actions={
          <>
            <Link href="/dashboard/anonymous-complaints/create" className="group">
              <Button size="sm" className="w-full sm:w-auto">
                <FileText className="mr-2 h-3.5 w-3.5" />File a Complaint
              </Button>
            </Link>
          </>
        }
      />

      <div className="py-7 mx-auto space-y-6">

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3.5">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            All complaints are handled anonymously. You'll receive a <span className="font-semibold">unique tracking ID</span> after submission to follow up without revealing your identity.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/dashboard/anonymous-complaints/create" className="group">
            <div className="flex flex-col justify-between h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">File a Complaint</h2>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  Anonymously report a workplace incident. Supports harassment, discrimination, misconduct, and more.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {['Takes ~5 minutes', 'No login required', 'Reviewed within 7 working days'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gray-300" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                Get started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/anonymous-complaints/track" className="group">
            <div className="flex flex-col justify-between h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Search className="h-4 w-4 text-gray-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Track a Complaint</h2>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  Use your tracking ID to check progress, read officer responses, and stay updated.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {['Real-time status updates', 'Secure anonymous access', 'Two-way communication'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gray-300" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 group-hover:text-gray-900 transition-colors duration-200">
                Enter tracking ID
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        {/* Process Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">How it works</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[
              { step: '1', label: 'Submit', desc: 'Fill out the anonymous form with incident details', icon: <FileText className="h-4 w-4" /> },
              { step: '2', label: 'Receive ID', desc: 'Get a unique tracking ID — save it securely', icon: <Lock className="h-4 w-4" /> },
              { step: '3', label: 'Under Review', desc: 'A compliance officer reviews your complaint', icon: <Clock className="h-4 w-4" /> },
              { step: '4', label: 'Resolution', desc: 'Action taken and outcome shared with you', icon: <CheckCircle2 className="h-4 w-4" /> },
            ].map((item, i, arr) => (
              <div key={item.step} className="relative flex items-start gap-3 sm:flex-col sm:gap-2">
                {/* Connector line */}
                {i < arr.length - 1 && (
                  <div className="hidden sm:block absolute top-4 left-8 right-0 h-px bg-gray-100" />
                )}
                <div className="relative z-10 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantees */}
        <div className="rounded-xl max-w-5xl mx-auto border border-blue-200 bg-blue-50 divide-y divide-gray-100 shadow-sm">
          <div className="px-5 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Security & Compliance</p>
          </div>
          {[
            { icon: <Eye className="h-4 w-4 text-gray-400" />, title: 'Complete Anonymity', desc: 'Your identity is never stored or revealed at any stage of the process.' },
            { icon: <Shield className="h-4 w-4 text-gray-400" />, title: 'POSH Compliant', desc: 'All complaints are handled in accordance with the POSH Act, 2013.' },
            { icon: <Lock className="h-4 w-4 text-gray-400" />, title: 'End-to-End Encrypted', desc: 'Submissions are encrypted in transit and at rest with zero-knowledge storage.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}