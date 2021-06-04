const blogService = require("./blogService.js");
const serviceWorker = require("./swRegister.js");
const gyroscope = require("./gyroscope.js");

let defferedPrompt;
blogService.loadLatestBlogPosts();
gyroscope.init();

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
    requestPushPermission: function () {
        serviceWorker.requestPushPermission();
    },
    vibrate() {
        if ("vibrate" in navigator) {
            // vibration API supported
            navigator.vibrate = navigator.vibrate ||
                navigator.webkitVibrate || navigator.mozVibrate ||
                navigator.msVibrate;
            navigator.vibrate([1000]);
        }
    },
    getGeolocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function success(position) {
                    console.log('latitude ' + position.coords.latitude + ' longitude ' + position.coords.longitude);
                    window.pageEvents.getAddress(position.coords.latitude, position.coords.longitude);
                },
                function error(error_message) {
                    console.log('An error has occured while retrieving location ' + error_message);
                });
        } else {
            console.log('geolocation is not enabled on this browser');
        }
    },
    getAddress(latitude, longitude) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=GOOGLE_KEY`;
        console.log("url:" + url);
        $.ajax(url)
            .then(
                function success(response) {
                    console.log({ response });
                    if (response === undefined || response.results === undefined) {
                        return;
                    }
                    const dataFromCity = response.results.find(obj => obj.types.includes('locality'));
                    $('#address-found').val(dataFromCity.formatted_address);
                    $('#address-button').hide();
                    $('#address-found-input').show();
                    console.log('User\'s Address Data is ' + response);
                },
                function fail(status) {
                    console.log('Request failed. Returned status of' + status);
                }
            );
    }
};

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    defferedPrompt = e;

    $("#install-container").show();
});

window.addEventListener("appinstalled", (evt) => {
    console.log("app foi adicionada na home screen!  Yuhuu!");
});
