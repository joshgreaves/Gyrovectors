let mobius_ctx = null;
let mobius_gyr_ctx = null;
let mobius_gyr_def_ctx = null;

let point1 = [0, 0];
let point2 = [0, 0];

let SCALE = 200;
let default_gyr_canvas = null;

function dot(u, v) {
    return u[0] * v[0] + u[1] * v[1];
}

function norm(u) {
    return Math.sqrt(dot(u, u));
}

function c_mult(c, u) {
    return [c * u[0], c * u[1]];
}

function c_add(c, u) {
    return [c + u[0], c + u[1]];
}

function v_add(u, v) {
    return [u[0] + v[0], u[1] + v[1]];
}

function MobiusAddition(u, v) {
    let lhs = c_mult(1 + 2 * dot(u, v) + dot(v, v), u);
    let rhs = c_mult(1 - dot(u, u), v);
    let top = v_add(lhs, rhs);
    let bottom = 1 + 2 * dot(u, v) + dot(u, u) * dot(v, v);
    return c_mult(1/bottom, top);
}

function MobiusGyration(u, v, w) {
    let lhs = c_mult(-1, MobiusAddition(u, v));
    let rhs = MobiusAddition(u, MobiusAddition(v, w));
    return MobiusAddition(lhs, rhs);
}

function RegisterListeners() {
    document.getElementById("mobius1-x1").addEventListener("input", UpdateImgs);
    document.getElementById("mobius1-x2").addEventListener("input", UpdateImgs);
    document.getElementById("mobius2-x1").addEventListener("input", UpdateImgs);
    document.getElementById("mobius2-x2").addEventListener("input", UpdateImgs);
}

function Setup() {
    // Get the existing canvases
    let canvas = document.getElementById("mobius-addition");
    mobius_ctx = canvas.getContext("2d");
    canvas = document.getElementById("mobius-gyration");
    mobius_gyr_ctx = canvas.getContext("2d");

    // Create the default canvas
    default_gyr_canvas = document.createElement("CANVAS");
    default_gyr_canvas.height = 500;
    default_gyr_canvas.width = 500;
    mobius_gyr_def_ctx = default_gyr_canvas.getContext("2d");

    mobius_ctx.translate(250, 250);
    mobius_gyr_ctx.translate(250, 250);
    mobius_gyr_def_ctx.translate(250, 250);

    // Setup the default context
    mobius_gyr_def_ctx.clearRect(-250, -250, 250, 250);
    mobius_gyr_def_ctx.strokeStyle = "black";

    // Grid axis
    mobius_gyr_def_ctx.beginPath();
    mobius_gyr_def_ctx.setLineDash([4, 2]);
    mobius_gyr_def_ctx.moveTo(-200, 0);
    mobius_gyr_def_ctx.lineTo(200, 0);
    mobius_gyr_def_ctx.moveTo(0, -200);
    mobius_gyr_def_ctx.lineTo(0, 200);
    mobius_gyr_def_ctx.stroke();

    // Circle
    mobius_gyr_def_ctx.beginPath();
    mobius_gyr_def_ctx.setLineDash([]);
    mobius_gyr_def_ctx.moveTo(200, 0);
    mobius_gyr_def_ctx.arc(0, 0, 200, 0, Math.PI * 2, true);
    mobius_gyr_def_ctx.stroke();
    mobius_gyr_def_ctx.clip();

    // Gradient
    let grad = mobius_gyr_def_ctx.createLinearGradient(0, -200, 0, 200);
    grad.addColorStop(0, '#9100c1');
    grad.addColorStop(1, '#ffffff');
    mobius_gyr_def_ctx.fillStyle = grad;
    mobius_gyr_def_ctx.fillRect(-250, -250, 500, 500);
}

function UpdateGyrationImg() {
    mobius_gyr_ctx.clearRect(-250, -250, 500, 500);
    for (let i = -50; i < 50; i++) {
        for (let j = -50; j < 50; j++) {
            if (norm([i / SCALE, j / SCALE]) <= 1.01) {
                let new_coord = c_mult(SCALE, MobiusGyration(point1, point2, [i / SCALE, j / SCALE]));
                new_coord = [Math.round(new_coord[0]), Math.round(new_coord[1])];
                let pixel = mobius_gyr_def_ctx.getImageData(i + 250, j + 250, 1, 1).data;
                mobius_gyr_ctx.fillStyle = "rgba(" + pixel[0] + "," + pixel[1] + "," + pixel[2] + "," + pixel[3] + ")";
                mobius_gyr_ctx.fillRect(new_coord[0], new_coord[1], 1, 1);
            }
        }
    }
}

function DrawGrid(ctx) {
    ctx.clearRect(-250, -250, 500, 500);
    ctx.strokeStyle = "black";

    // Grid axis
    ctx.beginPath();
    ctx.setLineDash([4, 2]);
    ctx.moveTo(-200, 0);
    ctx.lineTo(200, 0);
    ctx.moveTo(0, -200);
    ctx.lineTo(0, 200);
    ctx.stroke();

    // Circle
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(0, 0, 200, 0, Math.PI * 2, true);
    ctx.stroke();
}

function UpdateImgs() {
    point1 = [document.getElementById("mobius1-x1").valueOf()["value"],
        document.getElementById("mobius1-x2").valueOf()["value"]];
    point2 = [document.getElementById("mobius2-x1").valueOf()["value"],
        document.getElementById("mobius2-x2").valueOf()["value"]];

    UpdateMobius();
    UpdateGyrationImg();
}

function UpdateMobius() {
    let result = MobiusAddition(point1, point2);

    DrawGrid(mobius_ctx);

    mobius_ctx.strokeStyle = "rgb(255, 0, 0)";
    mobius_ctx.beginPath();
    mobius_ctx.arc(point1[0] * SCALE, point1[1] * (-SCALE), 2, 0, Math.PI * 2, true);
    mobius_ctx.stroke();

    mobius_ctx.strokeStyle = "rgb(0, 0, 255)";
    mobius_ctx.beginPath();
    mobius_ctx.arc(point2[0] * SCALE, point2[1] * (-SCALE), 2, 0, Math.PI * 2, true);
    mobius_ctx.stroke();

    mobius_ctx.strokeStyle = "rgb(0, 255, 0)";
    mobius_ctx.beginPath();
    mobius_ctx.arc(result[0] * SCALE, result[1] * (-SCALE), 2, 0, Math.PI * 2, true);
    mobius_ctx.stroke();
}

// function UpdateMobiusGyration() {
//     let result = MobiusGyration([m1x1, m1x2], [m2x1, m2x2], [m3x1, m3x2]);
//     console.log(result);
//
//     DrawGradient(mobius_gyr_ctx);
//
//     mobius_gyr_ctx.strokeStyle = "rgb(255, 0, 0)";
//     mobius_gyr_ctx.beginPath();
//     mobius_gyr_ctx.arc(m1x1 * SCALE, m1x2 * (-SCALE), 2, 0, Math.PI * 2, true);
//     mobius_gyr_ctx.stroke();
//
//     mobius_gyr_ctx.strokeStyle = "rgb(0, 0, 255)";
//     mobius_gyr_ctx.beginPath();
//     mobius_gyr_ctx.arc(m2x1 * SCALE, m2x2 * (-SCALE), 2, 0, Math.PI * 2, true);
//     mobius_gyr_ctx.stroke();
//
//     mobius_gyr_ctx.strokeStyle = "rgb(0, 255, 0)";
//     mobius_gyr_ctx.beginPath();
//     mobius_gyr_ctx.arc(m3x1 * SCALE, m3x2 * (-SCALE), 2, 0, Math.PI * 2, true);
//     mobius_gyr_ctx.stroke();
//
//     mobius_gyr_ctx.strokeStyle = "rgb(100, 100, 0)";
//     mobius_gyr_ctx.beginPath();
//     mobius_gyr_ctx.arc(result[0] * SCALE, result[1] * (-SCALE), 2, 0, Math.PI * 2, true);
//     mobius_gyr_ctx.stroke();
// }

function WhenReady() {
    Setup();

    DrawGrid(mobius_ctx);

    RegisterListeners();

    UpdateImgs();

    document.body.appendChild(default_gyr_canvas);
}

$('document').ready(WhenReady);
