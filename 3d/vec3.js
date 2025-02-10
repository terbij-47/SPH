class vec3
{
    x;
    y;
    z;

    constructor( x = 0, y = 0, z = 0 )
    {        
        this.x = x;
        this.y = y;
        this.z = z;

    }

    add( V )
    {
        return new vec3(this.x + V.x, this.y + V.y, this.z + V.z);
    }

    dot( V )
    {
        return this.x * V.x + this.y * V.y + this.z * V.z;
    }

    cross( V )
    {
        return new vec3(this.y * V.z - this.z * V.y, V.x * this.z - this.x * V.z, this.x * V.y - V.x * this.y);
    }

    len2(  )
    { 
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    len(  )
    {
        return Math.sqrt(this.len2());
    }

    mul( V )
    {
        return new vec3(this.x * V.x, this.y * V.y, this.z * V.z);
    }

    sub( V )
    {
        return new vec3(this.x - V.x, this.y - V.y, this.z - V.z);
    }

    mulN( N )
    {
        return new vec3(this.x * N, this.y * N, this.z * N); 
    }

    divN( N )
    {
        return new vec3(this.x / N, this.y / N, this.z / N);
    }

    normSelf()
    {
        let L = this.len();
        if (L != 0)
          this.x /= L, this.y /= L, this.z /= L;
        return this;
    }

    norm()
    {
        let L = this.len();
        if (L != 0)
          return new vec3(this.x / L, this.y / L, this.z / L);
        return this;        
    }

    maxC()
    {
        return Math.max(this.x, Math.max(this.y, this.z));
    }
}