define(["./notificationService.js"], function (notificationService) {
  let _serviceWorkerRegistration;

  function requestPermission() {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (
        result
      ) {
        // Handling deprecated version with callback.
        resolve(result);
      });
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log(
          "ServiceWorker registrado com sucesso no escopo: ",
          registration.scope
        );

        _serviceWorkerRegistration = registration;

        console.log({ pn: "PushManager" in window });

        if ("PushManager" in window) {
          console.log("this browser supports push manager");
          if (Notification.permission === "granted") {
            console.log("permission ja foi concedida para push notification");
            return;
          }
          $("#notification-subscribe-section").show();
        }
      },
      (err) => console.log("falha no registro do ServiceWorker: ", err)
    );
  }

  function subscribe() {
    notificationService.retrievePublicKey().then((key) => {
      //registrando push notification
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: key,
      };
      return _serviceWorkerRegistration.pushManager
        .subscribe(subscribeOptions)
        .then((pushSubscription) => {
          notificationService
            .storePushSubscription(pushSubscription)
            .then((response) => {
              if (response.status === 201) {
                console.log("subscrito nas notificacoes push");
              } else if (response.status === 204) {
                console.log("notificacoes push ja estao  registradas");
              } else {
                console.log("falhou para se subscrever");
              }
              $("#notification-subscribe-section").hide();
            })
            .catch((error) => {
              console.log("falhou para armazenar subscricao: " + error);
            });
        });
    });
  }

  return {
    requestPushPermission: () => {
      requestPermission().then((permissionResult) => {
        if (permissionResult !== "granted") {
          throw new Error("Permission not granted.");
        }
        subscribe();
      });
    },
  };
});
