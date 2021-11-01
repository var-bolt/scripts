const MERCHANT_CLIENT_ID_STORAGE_KEY = "var_test";

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function getOrSetMerchantClientID() {
    let merchantClientID = localStorage.getItem(MERCHANT_CLIENT_ID_STORAGE_KEY);
    if (!merchantClientID) {
        merchantClientID = uuidv4();
        localStorage.setItem(MERCHANT_CLIENT_ID_STORAGE_KEY, merchantClientID);
    }
    return merchantClientID;
}

function setupObserver() {
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            // Remove observer once item has it has been seen.
            observer.unobserve(entry.target);

            const imageElement = entry.target;
            const imageViewEvent = {
                "name": "image_view",
                "properties": {
                    "imageURL": imageElement.src,
                    "height": imageElement.height,
                    "width": imageElement.width,
                    "sizes": imageElement.sizes,
                    "alt": imageElement.alt,
                    "title": imageElement.title,
                },
            };
            console.log(JSON.stringify(imageViewEvent));
            if ('BoltTrack' in window) {
                console.log("posting to track!");
                window.BoltTrack.recordEvent(imageViewEvent.name, imageViewEvent.properties);
            }
        });
    };

    // Create observer that fires event once, at least, 50% of the target is in view port.
    const observer = new IntersectionObserver(callback, {threshold: 0.50});

    // Observe all images on page
    // TODO: Introduce timing logic to observe only if target is observed for at least 1 second.
    const items = document.querySelectorAll('img');
    items.forEach(item => observer.observe(item));
}

window.addEventListener('load', (event) => {
    console.log("************ Setting up event listener ************");
    if (!('IntersectionObserver' in window)) {
        console.error("IntersectionObserver feature unavailable in the browser. Not setting up tracking!");
        return;
    }
    setupObserver();
});
