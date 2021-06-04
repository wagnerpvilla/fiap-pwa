define([], function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function init() {
        if ('Gyroscope' in window) {
            let gyroscope = new Gyroscope();
            gyroscope.addEventListener('reading', e =>
                rotationHandler({
                    alpha: gyroscope.x,
                    beta: gyroscope.y,
                    gamma: gyroscope.z
                }));
            gyroscope.start();
        }
    }

    function rotationHandler(rotation) {
        var info, xyz = "[X, Y, Z]";
        var alpha; var beta; var gamma;
        if (rotation.alpha && rotation.beta &&
            rotation.gamma) {
            alpha = rotation.alpha.toFixed(2) * 100;
            beta = rotation.beta.toFixed(2) * 100;
            gamma = rotation.gamma.toFixed(2) * 100;
        }
        info = xyz.replace("X", alpha);
        info = info.replace("Y", beta);
        info = info.replace("Z", gamma);
        $('#rotation-info').html(info);
        ctx.fillStyle = 'green';
        ctx.fillRect(100, 100, alpha, 10);
        ctx.fillStyle = 'yellow';
        ctx.fillRect(120, 120, beta, 10);
        ctx.fillStyle = 'blue';
        ctx.fillRect(140, 140, gamma, 10);
        var interval = setInterval(function () {
            ctx.clearRect(0, 0, canvas.width,
                canvas.height);
        }, 50000);
    }

    return {
        init
    }

});