// src/app/api/meta/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getOrganizationId } from '@/lib/organization';

export async function GET(req: NextRequest) {
    try {
        const organizationId = await getOrganizationId();
        console.log('[Meta Connect] organizationId:', organizationId);

        const csrf = crypto.randomBytes(16).toString('hex');
        const state = Buffer.from(JSON.stringify({ csrf, organizationId })).toString('base64url');

        const cookieStore = await cookies();
        cookieStore.set('meta_oauth_csrf', csrf, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 600,
            path: '/',
        });

        const params = new URLSearchParams({
            client_id: process.env.META_APP_ID!,
            redirect_uri: process.env.META_REDIRECT_URI!,
            state,
            scope: [
                'pages_show_list',
                'pages_read_engagement',
                'ads_management',
                'ads_read',
                'leads_retrieval',
                'pages_manage_ads',
                'pages_manage_metadata',
                'business_management',
            ].join(','),
        });

        const url = `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
        console.log('[Meta Connect] redirecting to:', url);

        return NextResponse.redirect(url);
    } catch (err) {
        console.error('[Meta Connect] error:', err);
        return NextResponse.redirect(
            `${new URL('/', req.url).origin}/dashboard/integrations?error=meta_connect_failed`
        );
    }
}