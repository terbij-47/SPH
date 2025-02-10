// logic


class particle
{
    static counter = 0;
    pos;        // particle position
    a = new vec3();  // particle acceleration
    v = new vec3();  // particle velocity 
    p = 0;          // pressure
    ro = 0;         // density
    isBarrier;
    cell;       // in case of having cellSystem
    id;         // glabal particle id
    idInFluid;  // local id in fluid 
    fluid = undefined;

    constructor ( fluid, pos, isBarrier = 0 )    
    {
        this.fluid = fluid;
        this.pos = pos;
        this.isBarrier = isBarrier;
        this.id = particle.counter++;
    }
}

class fluid
{
    static counter = 0;
    visk;
    ro0;
    k;
    r;   // particle radius in simulation
    m;   // particle mass in simulation
    color;
    id;
    // for rendering
    particleCounter = 0;

    constructor( visk = 1.018/2, ro0 = 20, k = 20, R = 0.15, color = 0x8f00ff, m = 0.2 )    
    {
        this.visk = visk;
        this.ro0 = ro0;
        this.k = k;
        this.r = R;
        this.color = color;
        this.id = fluid.counter++;
        this.m = m;
    }
}

class simulation
{
    parts = [];
    fluids = [];
    borders = [];
    g;
    prevTime = Date.now();
    h; h2;
    boundSize = new vec3(4, 4, 4);
    cellSystem = null; 

    constructor( h = 0.3 )
    {
        this.h = h;
        this.h2 = h*h;
        this.g = new vec3(0, -9.81 / 1, 0);
    }

    createFluid( color = 0x8f00ff, R = 0.15, visk = 1.018/2, ro0 = 20, k = 20, m = 0.2  )
    {
        let fl = new fluid(visk, ro0, k, R, color, m);
        this.fluids.push(fl);
        return fl;
    }

    createParticle( fluid, pos, isBarrier = 0 )
    {
        let part = new particle(fluid, pos, isBarrier);
        this.parts.push(part);
        
        // add to fluid
        part.idInFluid = fluid.particleCounter;
        fluid.particleCounter++;

        // add to cell system
        if (this.cellSystem != null)
            this.cellSystem.insertPoint(part);
        
        return part;
    }

    createCellSystem( StartPos, GlobalBoundSize )
    {
        this.cellSystem = new cellSystem(StartPos, GlobalBoundSize.x, GlobalBoundSize.y, GlobalBoundSize.z, 
                                            this.h, this.h, this.h);
        this.boundSize = GlobalBoundSize;
    }

    createBorder( points )
    {
        this.borders.push(new border(points));
    }


    updateWithoutCellSystem( currentTime )
    {
        let time = Date.now();
        let deltaTime = (time - this.prevTime) / 1000;
        this.prevTime = time;

        // update acceleration
        
        // count density and pressure
        let densityConst = 315 / (64 * Math.PI * this.h**9); 
        for (let i of this.parts)
        {
            i.ro = 0;
            for (let j of this.parts)
            {
                let dist2 = (i.pos.sub(j.pos)).len2();
                if (this.h2 - dist2 > 0)
                {                
                    if (i !== j)
                    i.ro += j.fluid.m * (this.h2 - dist2)**3;
                }
            }
            i.ro *= densityConst;
            i.ro = i.ro < i.fluid.ro0 ? i.fluid.ro0 : i.ro;    
            i.p = i.ro < i.fluid.ro0 ? i.fluid.ro0 : i.fluid.k * (i.ro - i.fluid.ro0);
        }

        // count viskosity and pressure acceleration
        let viskosityConst = 45 / (Math.PI * this.h**6);
        for (let i of this.parts)
        {
            i.a = new vec3(); 
            let tmp = i.p / i.ro**2;       
            for (let j of this.parts)
            {
                let delta = i.pos.sub(j.pos); 
                let dist = delta.len();
                if (this.h - dist > 0)
                {
                    if (i !== j)
                    {                                                                                               // viskosity pressure
                        i.a = i.a.add( delta.norm().mulN(  j.fluid.m * (tmp + j.p / j.ro**2) * (this.h - dist)**2).      add(  ( j.v.sub(i.v) ).mulN(  j.fluid.visk * j.fluid.m * (this.h - dist) / (j.ro * i.ro) )  ));
                        // if (!i.isBarrier)
                        // i.a = i.a.add( ( j.v.sub(i.v) ).mulN(  visk * j.m * (h - dist) / (j.ro * i.ro) )); 
                    }
                
                }
            }
            i.a = i.a.mulN(viskosityConst);
        }

        // update position

        for (let i of this.parts)
        {
            i.a = i.a.add(this.g);
            i.v = i.v.add(i.a.mulN(deltaTime / 1));
            let oldPos = i.pos;            
            i.pos = i.pos.add(i.v.mulN(deltaTime / 1));
            if (Math.abs(i.pos.y) > this.boundSize.y)
            {
                i.v.y *= -0.9 * 0.9;
                i.pos.y = i.pos.y > 0 ? this.boundSize.y : -this.boundSize.y ;
            }
            if (Math.abs(i.pos.x) > this.boundSize.x)
            {
                i.v.x *= -0.9 * 0.9;
                i.pos.x = i.pos.x > 0 ? this.boundSize.x : -this.boundSize.x ;
            }
            if (Math.abs(i.pos.z) > this.boundSize.z)
            {
                i.v.z *= -0.9 * 0.9;
                i.pos.z = i.pos.z > 0 ? this.boundSize.z : -this.boundSize.z;
            }
            for (let bd of this.borders)
                if (bd.isIntersect(oldPos, i.pos))
                {
                    let len = i.v.len();
                    let dir = i.v.divN(len); 
                    i.v = dir.sub(bd.normal.mulN(2 * dir.dot(bd.normal))).norm().mulN(len * 0.9);
                }
    
        }
    }

    updateWithCellSystem( )
    {
        let time = Date.now();
        let deltaTime = (time - this.prevTime) / 1000;
        this.prevTime = time;
        deltaTime = Math.min(deltaTime, 0.016);

        // update acceleration
        
        // count density and pressure
        let densityConst = 315 / (64 * Math.PI * this.h**9); 
        for (let i of this.parts)
        {
            i.ro = 0;

            let func = (iPart, jPart, h2) => {
                let dist2 = (iPart.pos.sub(jPart.pos)).len2();
                if (h2 - dist2 > 0)
                    iPart.ro += jPart.fluid.m * (h2 - dist2)**3;
            };
            this.cellSystem.forNearest(i, func);

            i.ro *= densityConst;
            i.ro = i.ro < i.fluid.ro0 ? i.fluid.ro0 : i.ro;    
            i.p = i.ro < i.fluid.ro0 ? i.fluid.ro0 : i.fluid.k * (i.ro - i.fluid.ro0);
        }

        // count viskosity and pressure acceleration
        let viskosityConst = 45 / (Math.PI * this.h**6);
        for (let i of this.parts)
        {
            i.a = new vec3(); 
            i.tmp = i.p / i.ro**2;       

            let func = (iPart, jPart, h2) => {
                let delta = iPart.pos.sub(jPart.pos); 
                let dist = delta.len();
                let len = h2**0.5 - dist;
                if (len > 0)
                    iPart.a = iPart.a.add( delta.norm().mulN(  jPart.fluid.m * (iPart.tmp + jPart.p / jPart.ro**2) * len**2).      add(  ( jPart.v.sub(iPart.v) ).mulN(  jPart.fluid.visk * jPart.fluid.m * len / (jPart.ro * iPart.ro) )  ));                
            };
            this.cellSystem.forNearest(i, func);
            i.a = i.a.mulN(viskosityConst);
        }

        // update position
        for (let i of this.parts)
        {
            i.a = i.a.add(this.g);
            i.v = i.v.add(i.a.mulN(deltaTime));
            let oldPos = i.pos;
            i.pos = i.pos.add(i.v.mulN(deltaTime));

            let lost = 1 - 0.5;
            
            for (let bd of this.borders)
            {
                let res = bd.isIntersect(oldPos, i.pos);
                if (res[0])
                {
                    let len = i.v.len();
                    let dir = i.v.divN(len);
                    if (dir.dot(bd.normal) > 0)
                        bd.normal = bd.normal.mulN(-1);      
                    let newvy = bd.normal.mulN(-1 * dir.dot(bd.normal));
                    let newvx = dir.add(newvy);
                    i.v = newvy.mulN(len * lost).add(newvx.mulN(len));
                    i.pos = res[1].add(bd.normal.mulN(0.001));
                }
            }

            if (i.pos.y < this.cellSystem.pos.y )
            {
                i.v.y *= -lost;
                i.pos.y = this.cellSystem.pos.y;
            }
            else if (i.pos.y > this.cellSystem.diag.y)
            {
                i.v.y *= -lost;
                i.pos.y = this.cellSystem.diag.y;
            }

            if (i.pos.x < this.cellSystem.pos.x )
            {
                i.v.x *= -lost;
                i.pos.x = this.cellSystem.pos.x;
            }
            else if (i.pos.x > this.cellSystem.diag.x)
            {
                i.v.x *= -lost;
                i.pos.x = this.cellSystem.diag.x;
            }

            if (i.pos.z < this.cellSystem.pos.z )
            {
                i.v.z *= -lost;
                i.pos.z = this.cellSystem.pos.z;
            }
            else if (i.pos.z > this.cellSystem.diag.z)
            {
                i.v.z *= -lost;
                i.pos.z = this.cellSystem.diag.z;
            }
        }
        this.cellSystem.update();
    }

    update( currentTime )
    {
        if (this.cellSystem == null)
            this.updateWithoutCellSystem(currentTime);
        else this.updateWithCellSystem(currentTime);
    }
}







