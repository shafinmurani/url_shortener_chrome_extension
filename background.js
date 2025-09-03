// Create context menu when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "shortenLink",
        title: "Shorten By Shafin",
        contexts: ["page", "link"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const urlToShorten = info.linkUrl || info.pageUrl;

    try {
        const res = await fetch("https://url-shortener-backend-gray.vercel.app/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalUrl: urlToShorten })
        });

        const data = await res.json();
        const shortUrl = "https://url-shortener-ten-peach.vercel.app/" + data.shortUrl;

        // Clipboard copy via injected script (service workers can't use DOM)
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => navigator.clipboard.writeText(text),
            args: [shortUrl],
        });

        // Show notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "URL Shortened",
            message: shortUrl + " (copied!)"
        });

    } catch (err) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Error",
            message: "Failed to shorten URL: " + err.message
        });
    }
});
