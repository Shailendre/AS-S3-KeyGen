const checkIfHelperJSInjected = "typeof copy2Cb === 'function';";

/**
 * create AS context menu in background script
 */
chrome.contextMenus.create({
    id: "copy-as-s3-key",
    title: "Copy AS S3 Key",
    contexts: ["selection"],
});

/**
 * set the 'onclicked' logic
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {

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

    chrome.tabs.executeScript({
        code: checkIfHelperJSInjected
    }, function (checkResults) {
        if (!checkResults || checkResults[0] !== true) {
            chrome.tabs.executeScript(tab.id, {
                file: "script/clipboard-helper.js"
            }, function (injectResults) {
                if (injectResults) {
                    chrome.tabs.executeScript(tab.id, {
                        code: functionCall
                    }, function (copyResults) {
                        if (!copyResults) {
                            console.log("Failed to copy text: ");
                        }
                    })
                }
            })
        }
    });
}
