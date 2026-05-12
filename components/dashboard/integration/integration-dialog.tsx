// src/components/dashboard/integration/integration-dialog.tsx
'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, ExternalLink, Unplug } from 'lucide-react';
import { saveSmtpIntegration, disconnectSmtp, saveGoogleFormsIntegration, disconnectMeta } from '@/lib/data/integration/integrations';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  connectedMeta?: { pageName: string; connectedAt: Date; lastSyncAt: Date | null };
  connectedSmtp?: { host: string; email: string };
}

interface IntegrationDialogProps {
  integration: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IntegrationDialog({ integration, open, onOpenChange }: IntegrationDialogProps) {
  const [step, setStep] = useState<'initial' | 'credentials' | 'connecting' | 'success' | 'error'>(
    integration.connected ? 'success' : 'initial'
  );
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }));

  // ── Facebook: redirect to OAuth (no credentials form) ──
  if (integration.id === 'facebook-ads') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div>{integration.icon}</div>
              <div>
                <DialogTitle>{integration.name}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">{integration.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {integration.connected && integration.connectedMeta ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">Connected</span>
                </div>
                <div className="text-xs text-green-700 dark:text-green-400 space-y-1">
                  <p>Page: <span className="font-medium">{integration.connectedMeta.pageName}</span></p>
                  <p>Connected: {new Date(integration.connectedMeta.connectedAt).toLocaleDateString()}</p>
                  {integration.connectedMeta.lastSyncAt && (
                    <p>Last sync: {new Date(integration.connectedMeta.lastSyncAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => startTransition(async () => {
                    await disconnectMeta();
                    onOpenChange(false);
                  })}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Unplug className="h-4 w-4 mr-2" />Disconnect</>}
                </Button>
                <Button className="flex-1" onClick={() => onOpenChange(false)}>Done</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">What happens when you connect</p>
                <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>You&apos;ll be redirected to Facebook to log in</li>
                  <li>Grant permission to your Facebook Page</li>
                  <li>Leads from your ads will sync automatically</li>
                  <li>No credentials stored — OAuth only</li>
                </ol>
              </div>
              {/* This hits /api/meta/connect which redirects to Facebook OAuth */}
              <a href="/api/meta/connect" className="block">
                <Button className="w-full gap-2">
                  Continue with Facebook
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // ── SMTP ──
  if (integration.id === 'smtp') {
    const handleSmtpSubmit = () => {
      if (!fields.smtp_host || !fields.smtp_port || !fields.email || !fields.password) {
        setError('Please fill in all required fields.');
        return;
      }
      setError(null);
      setStep('connecting');
      startTransition(async () => {
        const result = await saveSmtpIntegration({
          host: fields.smtp_host,
          port: parseInt(fields.smtp_port),
          email: fields.email,
          password: fields.password,
          fromName: fields.from_name,
          encryption: fields.encryption,
        });
        if (result.success) setStep('success');
        else { setError(result.error ?? 'Connection failed'); setStep('credentials'); }
      });
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div>{integration.icon}</div>
              <div>
                <DialogTitle>{integration.name}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">{integration.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {step === 'initial' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 space-y-2">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">Setup guide</p>
                  <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Get SMTP details from your email provider</li>
                    <li>For Gmail: enable 2FA, then create an App Password</li>
                    <li>Enter host, port, email and password below</li>
                    <li>We&apos;ll test the connection before saving</li>
                  </ol>
                </div>
                <Button onClick={() => setStep('credentials')} className="w-full">Get Started</Button>
              </div>
            )}

            {(step === 'credentials' || step === 'connecting') && (
              <div className="space-y-3">
                {[
                  { id: 'smtp_host', label: 'SMTP Host *', placeholder: 'smtp.gmail.com', type: 'text', help: 'Your email providers SMTP server' },
                  { id: 'smtp_port', label: 'Port *', placeholder: '587', type: 'number', help: '587 (TLS) or 465 (SSL)' },
                  { id: 'email', label: 'Email Address *', placeholder: 'you@example.com', type: 'email', help: 'The address to send from' },
                  { id: 'password', label: 'Password / App Password *', placeholder: '••••••••', type: 'password', help: 'For Gmail use an App Password' },
                  { id: 'from_name', label: 'From Name', placeholder: 'Sales Team', type: 'text', help: 'Display name (optional)' },
                  { id: 'encryption', label: 'Encryption', placeholder: 'TLS', type: 'text', help: 'TLS or SSL (optional)' },
                ].map(f => (
                  <div key={f.id} className="space-y-1.5">
                    <Label htmlFor={f.id} className="text-sm">{f.label}</Label>
                    <Input id={f.id} type={f.type} placeholder={f.placeholder}
                      value={fields[f.id] ?? ''} onChange={e => set(f.id, e.target.value)}
                      disabled={step === 'connecting'} />
                    <p className="text-xs text-muted-foreground">{f.help}</p>
                  </div>
                ))}

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 flex gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('initial')} disabled={step === 'connecting'}>Back</Button>
                  <Button className="flex-1" onClick={handleSmtpSubmit} disabled={step === 'connecting'}>
                    {step === 'connecting' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Testing...</> : 'Connect'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-4 py-2">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">SMTP Connected</p>
                    {integration.connectedSmtp && (
                      <p className="text-xs text-muted-foreground mt-1">{integration.connectedSmtp.email} via {integration.connectedSmtp.host}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" disabled={isPending}
                    onClick={() => startTransition(async () => { await disconnectSmtp(); onOpenChange(false); })}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Unplug className="h-4 w-4 mr-2" />Disconnect</>}
                  </Button>
                  <Button className="flex-1" onClick={() => onOpenChange(false)}>Done</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Google Forms ──
  if (integration.id === 'google-forms') {
    const handleSubmit = () => {
      if (!fields.api_key || !fields.form_id) {
        setError('API Key and Form ID are required.');
        return;
      }
      setError(null);
      setStep('connecting');
      startTransition(async () => {
        const result = await saveGoogleFormsIntegration({ apiKey: fields.api_key, formId: fields.form_id });
        if (result.success) setStep('success');
        else { setError(result.error ?? 'Failed to connect'); setStep('credentials'); }
      });
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div>{integration.icon}</div>
              <div>
                <DialogTitle>{integration.name}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">{integration.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {step === 'initial' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 space-y-2">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">Setup guide</p>
                  <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Go to Google Cloud Console</li>
                    <li>Enable the Google Forms API</li>
                    <li>Create an API Key in Credentials</li>
                    <li>Copy your Form ID from the form URL</li>
                  </ol>
                </div>
                <Button onClick={() => setStep('credentials')} className="w-full">Get Started</Button>
              </div>
            )}

            {(step === 'credentials' || step === 'connecting') && (
              <div className="space-y-3">
                {[
                  { id: 'api_key', label: 'API Key *', placeholder: 'AIza...', type: 'password', help: 'From Google Cloud Console > Credentials' },
                  { id: 'form_id', label: 'Form ID *', placeholder: '1FAIpQLSf_xyz...', type: 'text', help: 'From your Google Form URL after /forms/d/' },
                ].map(f => (
                  <div key={f.id} className="space-y-1.5">
                    <Label htmlFor={f.id}>{f.label}</Label>
                    <Input id={f.id} type={f.type} placeholder={f.placeholder}
                      value={fields[f.id] ?? ''} onChange={e => set(f.id, e.target.value)}
                      disabled={step === 'connecting'} />
                    <p className="text-xs text-muted-foreground">{f.help}</p>
                  </div>
                ))}
                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 flex gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('initial')} disabled={step === 'connecting'}>Back</Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={step === 'connecting'}>
                    {step === 'connecting' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'Connect'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-semibold">Google Forms Connected</p>
                <Button className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}