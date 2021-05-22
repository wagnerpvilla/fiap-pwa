if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(
    (registration) => {
      console.log(
        "ServiceWorker registrado com sucesso no escopo: ",
        registration.scope
      );
    },
    (err) => console.log("falha no registro do ServiceWorker: ", err)
  );
}
