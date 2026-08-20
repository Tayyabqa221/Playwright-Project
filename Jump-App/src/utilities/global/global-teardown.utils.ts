export default async function globalTeardown() {
    const endpoint = process.env.TEARDOWN_API_ENDPOINT;
    const marker = process.env.TEST_SESSION_ID;
    const apiSecret = process.env.TEARDOWN_API_SECRET;
    const skipTeardown = process.env.SKIP_GLOBAL_TEARDOWN;

    console.log("globalTeardown started");
    if (skipTeardown === 'true') {
        console.log("globalTeardown: SKIP_GLOBAL_TEARDOWN is true; skipping cleanup call.");
        return;
    }
    if (!endpoint?.trim()) {
        console.log("globalTeardown: TEARDOWN_API_ENDPOINT is not set; skipping cleanup call.");
        return;
    }
    console.log("globalTeardown: marker", marker);
    console.log("globalTeardown: apiSecret", apiSecret);

    if (!marker) {
        console.log("globalTeardown: TEST_SESSION_ID is not set; skipping cleanup call.");
        return;
    }
    if (!apiSecret?.trim()) {
        console.log("globalTeardown: TEARDOWN_API_SECRET is not set; skipping cleanup call.");
        return;
    }
    
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-secret": apiSecret,
            },
            body: JSON.stringify({"marker": marker }),
        });
        
        if (!response.ok) {
            const responseText = await response.text().catch(() => "<no body>");
            console.error(`globalTeardown: Cleanup request failed with status ${response.status}. Body: ${responseText}`);
            return;
        }
        console.log("globalTeardown: Cleanup request completed successfully.");
    } catch (error) {
        return new Error("globalTeardown: Cleanup request threw an error:", error);
    }
 
} 