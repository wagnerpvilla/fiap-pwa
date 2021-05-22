const blogService = require("./blogService.js");
const serviceWorker = require("./swRegister.js");
let defferedPrompt;
blogService.loadLatestBlogPosts();

if (!"BackgroundFetchManager" in self) {
  alert("background fetch não está disponível neste site");
  return;
}

window.pageEvents = {
  loadBlogPost(link) {
    blogService.loadBlogPost(link);
  },
  loadMoreBlogPosts() {
    blogService.loadMoreBlogPosts();
  },

  tryAddHomeScreen() {
    defferedPrompt.prompt();
    defferedPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome == "accepted") {
        console.log("Usuário aceitou o A2HS prompt");
        $("#install-container").hide();
      }
      defferedPrompt = null;
    });
  },
  setBackgroundFetch(link) {
    if (!"BackgroundFetchManager" in self) {
      alert("background fetch não está disponível neste site");
      return;
    }
    alert("click");
    navigator.serviceWorker.ready.then(async (swReg) => {
      const bgFetch = await swReg.backgroundFetch.fetch(
        link,
        ["/Home/Post/?link=" + link],
        {
          title: link,
          icons: [
            {
              sizes: "192x192",
              src: "images/icons/icon-192x192.png",
              type: "image/png",
            },
          ],
          downloadTotal: 15000,
        }
      );
      bgFetch.addEventListener("progress", () => {
        if (!bgFetch.downloadTotal) return;
        const percent = Math.round(
          (bgFetch.downloaded / bgFetch.downloadTotal) * 100
        );
        console.log(`Download progress: ${percent}%`);
        console.log(`Download status: ${bgFetch.result}`);
        $(".download-start").hide();
        $("#status-download").show();
        $("#status-download > .progress > .progress-bar").css(
          "width",
          percent + "%"
        );
        if (bgFetch.result === "success") {
          $("#status-download > .text-success").show();
        }
      });
    });
  },
};

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  defferedPrompt = e;

  $("#install-container").show();
});

window.addEventListener("appinstalled", (evt) => {
  console.log("app foi adicionada na home screen!  Yuhuu!");
});
