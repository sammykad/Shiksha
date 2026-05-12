// src/app/api/meta/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { encrypt } from '@/lib/data/integration/crypto';

const APP_ID = process.env.META_APP_ID!;
const APP_SECRET = process.env.META_APP_SECRET!;
const REDIRECT = process.env.META_REDIRECT_URI!;

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetaPage {
    id: string;
    name: string;
    access_token: string;
}

interface MetaForm {
    id: string;
    name: string;
    status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function graphGet<T>(path: string, token: string): Promise<T> {
    const res = await fetch(`https://graph.facebook.com/v19.0${path}?access_token=${token}`);
    const data = await res.json();
    if (data.error) throw new Error(`Graph API error on ${path}: ${JSON.stringify(data.error)}`);
    return data as T;
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const baseUrl = new URL('/', req.url).origin;
    const failUrl = (reason: string) =>
        `${baseUrl}/dashboard/integrations?error=${reason}`;

    console.log('[Meta Callback] ← received', { hasCode: !!code, hasState: !!state, error });

    if (error || !code || !state) {
        console.error('[Meta Callback] ❌ Missing params:', { error, code: !!code, state: !!state });
        return NextResponse.redirect(failUrl('meta_denied'));
    }

    // ── 1. Verify CSRF ──────────────────────────────────────────────────────────
    let organizationId: string;
    try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
        const { csrf, organizationId: oid } = decoded;

        const cookieStore = await cookies();
        const storedCsrf = cookieStore.get('meta_oauth_csrf')?.value;

        if (!storedCsrf || storedCsrf !== csrf) {
            throw new Error(`CSRF mismatch — stored: ${storedCsrf}, received: ${csrf}`);
        }

        organizationId = oid;
        cookieStore.delete('meta_oauth_csrf');
        console.log('[Meta Callback] ✅ CSRF verified for org:', organizationId);
    } catch (e) {
        console.error('[Meta Callback] ❌ CSRF error:', e);
        return NextResponse.redirect(failUrl('meta_invalid_state'));
    }

    // ── 2. Token exchange ───────────────────────────────────────────────────────
    try {
        // Short-lived user token
        console.log('[Meta Callback] Exchanging code for token...');
        const tokenData = await graphGet<{ access_token: string }>(
            `/oauth/access_token`,
            ''
        ).catch(() => null); // handled below with raw fetch

        const tokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?` +
            new URLSearchParams({ client_id: APP_ID, client_secret: APP_SECRET, redirect_uri: REDIRECT, code })
        );
        const shortData = await tokenRes.json();
        if (shortData.error) throw new Error(`Token exchange: ${JSON.stringify(shortData.error)}`);
        const shortToken: string = shortData.access_token;
        console.log('[Meta Callback] ✅ Short-lived token obtained');

        // Long-lived user token (~60 days)
        const extendRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?` +
            new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: APP_ID, client_secret: APP_SECRET, fb_exchange_token: shortToken })
        );
        const extendData = await extendRes.json();
        if (extendData.error) throw new Error(`Token extend: ${JSON.stringify(extendData.error)}`);
        const longToken: string = extendData.access_token;
        console.log('[Meta Callback] ✅ Long-lived token obtained');

        // ── 3. Fetch Meta user ID ─────────────────────────────────────────────────
        const meData = await graphGet<{ id: string; name: string }>('/me', longToken);
        const metaUserId = meData.id;
        console.log('[Meta Callback] ✅ Meta user ID:', metaUserId);

        // ── 4. Fetch pages ────────────────────────────────────────────────────────
        const pagesData = await graphGet<{ data: MetaPage[] }>('/me/accounts', longToken);
        const pages = pagesData.data;

        if (!pages?.length) {
            console.warn('[Meta Callback] ⚠️ No pages found for this user');
            return NextResponse.redirect(failUrl('meta_no_pages'));
        }

        console.log(`[Meta Callback] Found ${pages.length} page(s)`);

        // ── 5. Multiple pages → page picker ───────────────────────────────────────
        if (pages.length > 1) {
            const cookieStore = await cookies();
            cookieStore.set(
                'meta_pages_pending',
                JSON.stringify({ pages, organizationId, metaUserId }),
                { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 300, path: '/' }
            );
            return NextResponse.redirect(`${baseUrl}/dashboard/integrations/meta/select-page`);
        }

        // ── 6. Single page → auto connect ────────────────────────────────────────
        const page = pages[0];
        console.log('[Meta Callback] Auto-connecting single page:', { id: page.id, name: page.name });

        await connectMetaPage({ organizationId, metaUserId, page });

        console.log('[Meta Callback] ✅ Connected successfully');
        return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=meta_connected`);

    } catch (err: any) {
        console.error('[Meta Callback] ❌ OAuth error:', {
            message: err.message,
            redirect_uri: REDIRECT,
            app_id: APP_ID,
            has_app_secret: !!APP_SECRET,
        });
        return NextResponse.redirect(failUrl('meta_failed'));
    }
}

// ─── connectMetaPage ──────────────────────────────────────────────────────────

async function connectMetaPage({
    organizationId,
    metaUserId,
    page,
}: {
    organizationId: string;
    metaUserId: string;
    page: MetaPage;
}) {
    console.log('[Meta connectMetaPage] Fetching lead forms for page:', page.id);

    // Fetch all lead forms for this page
    let subscribedFormIds: string[] = [];
    try {
        const formsRes = await fetch(
            `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms` +
            `?fields=id,name,status&access_token=${page.access_token}`
        );
        const formsData = await formsRes.json();

        if (formsData.error) {
            console.warn('[Meta connectMetaPage] ⚠️ Could not fetch forms:', formsData.error);
        } else {
            const activeForms: MetaForm[] = (formsData.data ?? []).filter(
                (f: MetaForm) => f.status === 'ACTIVE'
            );
            subscribedFormIds = activeForms.map(f => f.id);
            console.log(`[Meta connectMetaPage] ✅ Found ${activeForms.length} active form(s):`,
                activeForms.map(f => `${f.name} (${f.id})`));
        }
    } catch (e) {
        console.warn('[Meta connectMetaPage] ⚠️ Form fetch threw:', e);
    }

    // Upsert integration with real metaUserId + form IDs
    console.log('[Meta connectMetaPage] Upserting MetaIntegration...');
    await prisma.metaIntegration.upsert({
        where: { organizationId },
        create: {
            organizationId,
            metaUserId,                              // ✅ real user ID
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: encrypt(page.access_token),
            subscribedFormIds,                       // ✅ real form IDs
            isActive: true,
            connectedAt: new Date(),
        },
        update: {
            metaUserId,                              // ✅ update if reconnecting
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: encrypt(page.access_token),
            subscribedFormIds,                       // ✅ refresh form IDs
            isActive: true,
            connectedAt: new Date(),
        },
    });
    console.log('[Meta connectMetaPage] ✅ MetaIntegration upserted');

    // Subscribe page to webhook
    console.log('[Meta connectMetaPage] Subscribing page to leadgen webhook...');
    const subRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}/subscribed_apps`,
        {
            method: 'POST',
            body: new URLSearchParams({
                subscribed_fields: 'leadgen',
                access_token: page.access_token,
            }),
        }
    );

    const subData = await subRes.json();
    if (!subRes.ok || subData.error) {
        throw new Error(`Webhook subscription failed: ${JSON.stringify(subData)}`);
    }

    console.log('[Meta connectMetaPage] ✅ Webhook subscription confirmed:', subData);
}