"use client";

import useFcmToken from "@/hooks/use-fcm-token";


export default function FcmInitializer() {
    useFcmToken();  // ← this FULLY executes
    //   permission prompt, token fetch,
    //   save to DB — all of it runs

    return null;    // ← just means: don't paint anything on screen
    //   zero HTML output, but the hook already ran
}