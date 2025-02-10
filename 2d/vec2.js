class vec2
{
    X;
    Y;

    constructor( x = 0, y = 0 )
    {        
        this.X = x;
        this.Y = y;
    }

    add( V )
    {
        return new vec2(this.X + V.X, this.Y + V.Y);
    }

    dot( V )
    {
        return this.X * V.X + this.Y * V.Y;
    }

    len2(  )
    { 
        return this.X * this.X + this.Y * this.Y;
    }

    len(  )
    {
        return Math.sqrt(this.len2());
    }

    mul( V )
    {
        return new vec2(this.X * V.X, this.Y * V.Y);
    }

    div( V )
    {
        return new vec2(this.X / V.X, this.Y / V.Y);
    }


    sub( V )
    {
        return new vec2(this.X - V.X, this.Y - V.Y);
    }

    mulN( N )
    {
        return new vec2(this.X * N, this.Y * N); 
    }

    divN( N )
    {
        return new vec2(this.X / N, this.Y / N);
    }

    normSelf()
    {
        let L = this.len();
        if (L != 0)
          this.X /= L, this.Y /= L;
        return this;
    }

    norm()
    {
        let L = this.len();
        if (L != 0)
          return new vec2(this.X / L, this.Y / L);
        return this;        
    }

    maxC()
    {
        return Math.max(this.X, this.Y);
    }
}

class vec3
{
    X; Y; Z;

    constructor( x, y, z )
    {
        this.X = x; this.Y = y; this.Z = z;      
    } 
}