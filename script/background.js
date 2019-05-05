const checkIfHelperJSInjected = "typeof copy2Cb === 'function';";

/**
 * create AS context menu in background script
 */
browser.contextMenus.create({
    id: "copy-as-s3-key",
    title: "Copy AS S3 Key",
    contexts: ["selection"],
});

/**
 * set the 'onclicked' logic
 */
browser.contextMenus.onClicked.addListener((info, tab) => {

    if (info.menuItemId === "copy-as-s3-key") {

        let selectedText = info.selectionText;
        let s3Key = getS3Key(selectedText.trim());
        console.log("S3 Key: " + s3Key);

        if (s3Key.length === 0) {
            alert("Invalid selected text length");
            return;
        }
        executeCopyToCb(tab, s3Key);
    }
});

/**
 *
 * @param text
 * @returns {string} s3 key
 */
function getS3Key(text) {

    if (text.length === 0) {
        return text;
    }

    return md5(text).substr(0, 5) + "." + text;
}

/**
 *
 * @param tab
 * @param text
 */
function executeCopyToCb(tab, text) {

    let functionCall = "copyToCb(" + JSON.stringify(text) + ");";

    browser.tabs.executeScript({
        code: checkIfHelperJSInjected
    // see if script injected already
    }).then((results) => {
        if (!results || results[0] !== true) {
            return browser.tabs.executeScript(tab.id, {
                file: "script/clipboard-helper.js",
            });
        }
    // either ways call the function copyToCb
    }).then(() => {
        return browser.tabs.executeScript(tab.id, {
            code: functionCall,
        });
    // errors
    }).catch((error) => {
        // This could happen if the extension is not allowed to run functionCall in
        // the page, for example if the tab is a privileged page.
        console.error("Failed to copy text: " + error);
    });
}
