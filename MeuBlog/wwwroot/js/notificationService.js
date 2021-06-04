define([], function () {
  function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  return {
    retrievePublicKey() {
      return fetch("/publickey").then((response) => {
        if (response.ok) {
          return response
            .text()
            .then((applicationServerPublicKeyBase64) =>
              urlB64ToUint8Array(applicationServerPublicKeyBase64)
            );
        } else {
          return Promise.reject(`${response.status} ${response.statusText}`);
        }
      });
    },
    storePushSubscription(pushSubscription) {
      return fetch("/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pushSubscription),
      });
    },
    discardPushSubscription(pushSubscription) {
      return fetch(
        `/subscriptions?endpoint=${encodeURIComponent(
          pushSubscription.endpoint
        )}`,
        {
          method: "DELETE",
        }
      );
    },
  };
});