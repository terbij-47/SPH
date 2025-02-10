class vec2
{
    x;
    y;

    constructor( x = 0, y = 0 )
    {        
        this.x = x;
        this.y = y;
    }

    add( V )
    {
        return new vec2(this.x + V.x, this.y + V.y);
    }

    dot( V )
    {
        return this.x * V.x + this.y * V.y;
    }

    len2(  )
    { 
        return this.x * this.x + this.y * this.y;
    }

    len(  )
    {
        return Math.sqrt(this.len2());
    }

    mul( V )
    {
        return new vec2(this.x * V.x, this.y * V.y);
    }

    div( V )
    {
        return new vec2(this.x / V.x, this.y / V.y);
    }


    sub( V )
    {
        return new vec2(this.x - V.x, this.y - V.y);
    }

    mulN( N )
    {
        return new vec2(this.x * N, this.y * N); 
    }

    divN( N )
    {
        return new vec2(this.x / N, this.y / N);
    }

    normSelf()
    {
        let L = this.len();
        if (L != 0)
          this.x /= L, this.y /= L;
        return this;
    }

    norm()
    {
        let L = this.len();
        if (L != 0)
          return new vec2(this.x / L, this.y / L);
        return this;        
    }

    maxC()
    {
        return Math.max(this.x, this.y);
    }
}
