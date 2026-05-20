// src/app/api/meta/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma-base';
import { decrypt } from '@/lib/data/integration/crypto';

export const maxDuration = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadFieldData {
    name: string;
    values: string[];
}

interface GraphLeadResponse {
    field_data: LeadFieldData[];
    error?: { message: string; code: number };
}

interface LeadgenChangeValue {
    page_id: string;
    leadgen_id: string;
    form_id?: string;
    ad_id?: string;
    adgroup_id?: string;
    created_time?: number;
}

interface LeadgenChange {
    field: string;
    value: LeadgenChangeValue;
}

interface WebhookEntry {
    id: string;
    time: number;
    changes: LeadgenChange[];
}

interface MetaWebhookPayload {
    object: string;
    entry: WebhookEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequestId(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function tag(requestId: string, step?: string): string {
    return step ? `[${requestId}][${step}]` : `[${requestId}]`;
}

function getField(fields: LeadFieldData[], key: string): string | null {
    return fields?.find((f) => f.name === key)?.values?.[0] ?? null;
}

function buildStudentName(fields: LeadFieldData[]): string {
    return (
        getField(fields, 'full_name')?.trim() ||
        [getField(fields, 'first_name'), getField(fields, 'last_name')]
            .filter(Boolean)
            .join(' ')
            .trim() ||
        'Unknown'
    );
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
    if (!signatureHeader || !process.env.META_APP_SECRET) return false;

    const expected =
        'sha256=' +
        crypto
            .createHmac('sha256', process.env.META_APP_SECRET)
            .update(rawBody)
            .digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHeader),
            Buffer.from(expected),
        );
    } catch {
        // Buffer lengths differ → definitely a mismatch
        return false;
    }
}

// ─── GET — Meta verification handshake ───────────────────────────────────────
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    console.log("!!! WEBHOOK ATTEMPT RECEIVED !!!");
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        console.log('[Meta Webhook] ✅ Verification handshake succeeded');
        return new NextResponse(challenge, { status: 200 });
    }

    console.warn('[Meta Webhook] ❌ Verification failed', { mode, token });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ─── POST — Real-time lead webhook ───────────────────────────────────────────

export async function POST(req: NextRequest) {
    const requestId = makeRequestId();
    const startTime = Date.now();
    console.log("!!! WEBHOOK ATTEMPT RECEIVED !!!");
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${tag(requestId)} META WEBHOOK RECEIVED`);
    console.log(`${tag(requestId)} Time: ${new Date().toISOString()}`);
    console.log(`${'═'.repeat(60)}\n`);

    // 1. Read raw body
    let rawBody: string;
    try {
        rawBody = await req.text();
        console.log(`${tag(requestId, 'BODY')} Length: ${rawBody.length} bytes`);
    } catch (err: any) {
        console.error(`${tag(requestId, 'BODY')} ❌ Failed to read body:`, err.message);
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    // 2. Verify signature
    if (process.env.META_VERIFY_SIGNATURES === 'true') {
        const sig = req.headers.get('x-hub-signature-256');
        if (!verifySignature(rawBody, sig)) {
            console.error(`${tag(requestId, 'SIG')} ❌ Signature mismatch — possible spoofed request`);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }
        console.log(`${tag(requestId, 'SIG')} ✅ Signature verified`);
    } else {
        console.warn(`${tag(requestId, 'SIG')} ⚠️  Signature verification is DISABLED`);
    }

    // 3. Parse JSON
    let payload: MetaWebhookPayload;
    try {
        payload = JSON.parse(rawBody);
        console.log(`${tag(requestId, 'PARSE')} object="${payload.object}", entries=${payload.entry?.length ?? 0}`);
    } catch (err: any) {
        console.error(`${tag(requestId, 'PARSE')} ❌ Invalid JSON:`, err.message);
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    // 4. Process — awaited so logs flush before Vercel freezes the function
    try {
        await processPayload(payload, requestId);
        console.log(`\n${tag(requestId)} ✅ Completed in ${Date.now() - startTime}ms\n`);
    } catch (err: any) {
        console.error(`\n${tag(requestId)} ❌ Processing failed after ${Date.now() - startTime}ms:`, err.message);
        // Still return 200 — Meta will retry on non-2xx, causing duplicate leads
    }

    return NextResponse.json({ status: 'ok' });
}

// ─── Payload processor ───────────────────────────────────────────────────────

async function processPayload(payload: MetaWebhookPayload, requestId: string) {
    if (payload.object !== 'page') {
        console.log(`${tag(requestId, 'PROCESS')} ⚠️  Skipping — object type is "${payload.object}", expected "page"`);
        return;
    }

    if (!payload.entry?.length) {
        console.log(`${tag(requestId, 'PROCESS')} ⚠️  No entries in payload`);
        return;
    }

    for (const entry of payload.entry) {
        for (const change of entry.changes ?? []) {
            if (change.field !== 'leadgen') {
                console.log(`${tag(requestId, 'PROCESS')} ⚠️  Skipping change field: "${change.field}"`);
                continue;
            }

            console.log(`${tag(requestId, 'PROCESS')} 🎯 Leadgen change — leadgen_id: ${change.value.leadgen_id}`);
            await processLeadgenChange(change.value, requestId);
        }
    }
}

// ─── Lead processor ──────────────────────────────────────────────────────────

async function processLeadgenChange(
    { page_id, leadgen_id, form_id, ad_id }: LeadgenChangeValue,
    requestId: string,
) {
    const L = (step: string) => tag(requestId, step);

    console.log(`\n${'-'.repeat(50)}`);
    console.log(`${L('LEAD')} leadgen_id : ${leadgen_id}`);
    console.log(`${L('LEAD')} page_id    : ${page_id}`);
    console.log(`${L('LEAD')} form_id    : ${form_id ?? '—'}`);
    console.log(`${L('LEAD')} ad_id      : ${ad_id ?? '—'}`);
    console.log(`${'-'.repeat(50)}\n`);

    // ── Step 1: Find active integration ────────────────────────────────────────
    const integration = await prisma.metaIntegration.findFirst({
        where: { pageId: page_id, isActive: true },
    });

    if (!integration) {
        console.error(`${L('STEP 1')} ❌ No active integration found for page_id: ${page_id}`);
        return;
    }
    console.log(`${L('STEP 1')} ✅ Integration found (org: ${integration.organizationId})`);

    // ── Step 2: Idempotency check ───────────────────────────────────────────────
    const duplicate = await prisma.lead.findFirst({
        where: {
            organizationId: integration.organizationId,
            notes: { contains: leadgen_id },
        },
        select: { id: true, studentName: true },
    });

    if (duplicate) {
        console.log(`${L('STEP 2')} ⚠️  Duplicate — leadgen_id already imported (lead.id: ${duplicate.id}, name: ${duplicate.studentName})`);
        return;
    }
    console.log(`${L('STEP 2')} ✅ No duplicate found`);

    // ── Step 3: Decrypt access token ────────────────────────────────────────────
    let accessToken: string;
    try {
        accessToken = decrypt(integration.pageAccessToken);
        console.log(`${L('STEP 3')} ✅ Access token decrypted`);
    } catch (err: any) {
        console.error(`${L('STEP 3')} ❌ Token decryption failed:`, err.message);
        return;
    }

    // ── Step 4: Fetch lead fields from Graph API ────────────────────────────────
    let fields: LeadFieldData[];
    try {
        const res = await fetch(
            `${GRAPH_API_BASE}/${leadgen_id}?access_token=${accessToken}`,
        );
        const data: GraphLeadResponse = await res.json();

        if (data.error) {
            console.error(`${L('STEP 4')} ❌ Graph API error [${data.error.code}]: ${data.error.message}`);
            return;
        }

        fields = data.field_data;
        console.log(`${L('STEP 4')} ✅ Fetched ${fields.length} field(s) from Graph API`);
        console.log(`${L('STEP 4')} Fields:`, fields.map((f) => `${f.name}=${f.values[0]}`).join(', '));
    } catch (err: any) {
        console.error(`${L('STEP 4')} ❌ Graph API request failed:`, err.message);
        return;
    }

    // ── Step 5: Resolve current academic year ───────────────────────────────────
    const academicYear = await prisma.academicYear.findFirst({
        where: { organizationId: integration.organizationId, isCurrent: true },
        select: { id: true, name: true },
    });

    if (!academicYear) {
        console.error(`${L('STEP 5')} ❌ No current academic year for org: ${integration.organizationId}`);
        return;
    }
    console.log(`${L('STEP 5')} ✅ Academic year: "${academicYear.name}" (${academicYear.id})`);

    // ── Step 6: Build lead payload ──────────────────────────────────────────────
    const leadData = {
        studentName: buildStudentName(fields),
        parentName: getField(fields, 'parent_name'),
        phone: getField(fields, 'phone_number') ?? '',
        email: getField(fields, 'email'),
        whatsappNumber: getField(fields, 'whatsapp_number'),
        enquiryFor: getField(fields, 'class_enquiry') ?? getField(fields, 'grade') ?? '',
        currentSchool: getField(fields, 'current_school'),
        city: getField(fields, 'city'),
        state: getField(fields, 'state'),
        pinCode: getField(fields, 'zip_code') ?? getField(fields, 'pin_code'),
        address: getField(fields, 'street_address'),
    };

    console.log(`${L('STEP 6')} Lead payload:`, {
        ...leadData,
        phone: leadData.phone ? `***${leadData.phone.slice(-4)}` : '',
    });

    // ── Step 7: Persist lead + activity in a transaction ────────────────────────
    try {
        const created = await prisma.$transaction(async (tx) => {
            const lead = await tx.lead.create({
                data: {
                    organizationId: integration.organizationId,
                    academicYearId: academicYear.id,

                    ...leadData,

                    source: 'FACEBOOK_ADS',
                    status: 'NEW',
                    priority: 'MEDIUM',
                    notes: `Meta Lead ID: ${leadgen_id}`,

                    activities: {
                        create: {
                            type: 'OTHER',
                            title: 'Lead captured from Meta ad',
                            description: `Auto-imported via Facebook/Instagram Lead Ad.\nMeta Lead ID: ${leadgen_id}${ad_id ? `\nAd ID: ${ad_id}` : ''}${form_id ? `\nForm ID: ${form_id}` : ''}`,
                            performedAt: new Date(),
                        },
                    },
                },
                select: { id: true, studentName: true },
            });

            await tx.metaIntegration.update({
                where: { id: integration.id },
                data: { lastSyncAt: new Date() },
            });

            return lead;
        });

        console.log(`\n${'★'.repeat(50)}`);
        console.log(`${L('STEP 7')} ✅ LEAD SAVED SUCCESSFULLY`);
        console.log(`${L('STEP 7')} lead.id      : ${created.id}`);
        console.log(`${L('STEP 7')} studentName  : ${created.studentName}`);
        console.log(`${L('STEP 7')} leadgen_id   : ${leadgen_id}`);
        console.log(`${L('STEP 7')} org          : ${integration.organizationId}`);
        console.log(`${'★'.repeat(50)}\n`);
    } catch (err: any) {
        console.error(`${L('STEP 7')} ❌ DB transaction failed:`, err.message);
        throw err; // re-throw so the caller logs total duration
    }
}
