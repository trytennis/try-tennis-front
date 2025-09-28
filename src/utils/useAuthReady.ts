// utils/useAuthReady.ts
import { useEffect, useState } from "react";
import { onAuthReady, getCachedSession, waitForAccessToken } from "./authState";

export function useAuthReady() {
    const [ready, setReady] = useState(() => {
        const session = getCachedSession();
        const hasToken = !!session?.access_token;
        console.log('🔍 useAuthReady 초기값:', { session, hasToken }); // 디버깅
        return hasToken;
    });

    useEffect(() => {
        console.log('🔍 useAuthReady effect 실행, ready:', ready); // 디버깅

        if (ready) return;

        const off = onAuthReady(async () => {
            console.log('🔍 onAuthReady 콜백 실행'); // 디버깅
            await waitForAccessToken(500);
            const session = getCachedSession();
            const hasToken = !!session?.access_token;
            console.log('🔍 토큰 대기 후:', { session, hasToken }); // 디버깅
            setReady(hasToken);
        });
        return off;
    }, [ready]);

    return ready;
}