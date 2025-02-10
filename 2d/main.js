// Пробная версия проекта в 2д
// В 2д проще искать ошибки


window.addEventListener("load", main, false);

// frame 
let ctx; var W; var H;

// conditions
const h = 0.3;
const h2 = h * h;
const RPixel = 6;
const R = 0.055; 
const k = 20;
const ro0 = 20;
const visk = 1.018 / 2;
const g = new vec2(0, -9.81 * 1);
const scale = 70;


class particle
{
    static counter = 0;
    pos; a = new vec2(); v = new vec2(); m; p = 0; ro = 0;
    isBarrier;
    cell;
    id;

    constructor (pos, m, isBarrier = 0)    
    {
        this.pos = pos; this.m = m;
        this.isBarrier = isBarrier;
        this.id = particle.counter++;
    }
}

class fluid
{
    Parts = [];
    visk; ro0; h; k;

    constructor(){}
}

// change coordinate system function
// pos - in pixels in standart canvas coordinate system
// returns - in simulation coordinate system. (0, 0) is in the (0, H) of standart CS
let ToSim = (pos, h = 800) => {
    return pos.add(new vec2(0, -h)).divN(scale).mul(new vec2(1, -1));    
}

let ToStd = (pos, h = 800) =>{
    return pos.mul(new vec2(scale, -scale)).add(new vec2(0, h));
}

Parts = [];
for (let i = 25; i > 0; i--)
    for (let j = 25; j > 0; j--)
        Parts.push(new particle(ToSim( new vec2(50 + i * 4 * R * scale, 600 - j * 4 * R * scale) ), 0.2));

let diag = ToSim(new vec2(800, 0));
let cells = new cellSystem(new vec2(0, 0), diag.X, diag.Y, h * 5, h * 5);
console.log(cells);


console.log();

for (let p of Parts)
    cells.insertPoint(p);

console.log(Parts);

// timing
const Fps = 60;
const DeltaTime = 1 / Fps;
let CurrentTime;
StartFlag = 0;

console.log();

// ball params

function update()
{
    ctx.clearRect(0, 0, W, H);

    // count density and pressure
    let densityConst = 315 / (64 * Math.PI * h**9); 
    for (i of Parts)
    {
        i.ro = 0;
        for (j of Parts)
        {
            let dist2 = (i.pos.sub(j.pos)).len2();
            if (h2 - dist2 > 0)
            {                
                if (i !== j)
                i.ro += j.m * (h2 - dist2)**3;
            }
        }
        i.ro *= densityConst;
        i.ro = i.ro < ro0 ? ro0 : i.ro;    
        i.p = i.ro < ro0 ? ro0 : k * (i.ro - ro0); 

    }

    // count viskosity and pressure acceleration
    let viskosityConst = 45 / (Math.PI * h**6);
    for (i of Parts)
    {
        i.a = new vec2(); 
        let tmp = i.p / i.ro**2;       
        for (j of Parts)
        {
            let delta = i.pos.sub(j.pos); 
            let dist = delta.len();
            if (h - dist > 0)
            {
                if (i !== j)
                {                                                                                               // viskosity pressure
                    i.a = i.a.add( delta.norm().mulN(  j.m * (tmp + j.p / j.ro**2) * (h - dist)**2).      add(  ( j.v.sub(i.v) ).mulN(  visk * j.m * (h - dist) / (j.ro * i.ro) )  ));
                    // if (!i.isBarrier)
                    // i.a = i.a.add( ( j.v.sub(i.v) ).mulN(  visk * j.m * (h - dist) / (j.ro * i.ro) )); 
                }
                
            }
        }
        i.a = i.a.mulN(viskosityConst);
    }

    for (i of Parts)
    {
        i.a = i.a.add(g);
        i.v = i.v.add(i.a.mulN(DeltaTime / 3));
        if (!i.isBarrier)
        {
            i.pos = i.pos.add(i.v.mulN(DeltaTime / 3));
        }
        if (i.pos.Y * scale > H)
        {
            i.v.Y *= -0.9 * 0.9;
            i.pos.Y = (H - RPixel * 0) / scale;
        }
        if (i.pos.Y * scale < 0)
        {
            i.v.Y *= -0.9 * 0.9;
            i.pos.Y = RPixel * 0 / scale;
        }
        if (i.pos.X * scale < 0)
        {
            i.v.X *= -0.9 * 0.9;
            i.pos.X = RPixel * 0 / scale;
        }
        if (i.pos.X * scale > W)
        {
            i.v.X *= -0.9 * 0.9;
            i.pos.X = (W - RPixel * 0) / scale;
        }

    }       
}


function render()
{
    Parts.forEach(el => {
        ctx.beginPath();
        let pos = ToStd(el.pos);
        ctx.arc(pos.X, pos.Y, RPixel, 0, 2 * Math.PI);        
        ctx.fillStyle = `rgb(${el.ro * 3}, 0, ${255 - el.ro * 3})`;
        // ctx.fillStyle = `rgb(${el.cell.Color.X}, ${el.cell.Color.Y}, ${el.cell.Color.Z})`;

        ctx.fill();            
    });
    cells.render(ToStd, ctx);
}

function sim()
{
    update();  
    cells.update();  
    render();
}

function main()
{
    let Canvas = document.getElementById('canvas');
    H = Canvas.height;
    W = Canvas.width;
    ctx = Canvas.getContext("2d");

    setInterval(sim, 1000 * DeltaTime);
}
