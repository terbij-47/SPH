class border
{
    points3d = [];  // vec3
    normal;   // vec3
    ox2;  // vec3
    oy2;  // vec3
    points2d = [new vec2(0, 0)];    // vec2

    constructor( points )
    {        
        this.points3d = points;
        this.ox2 = (points[1].sub(points[0])).norm();
        this.normal = (this.ox2).cross(points[2].sub(points[0])).norm();
        this.oy2 = this.ox2.cross(this.normal);
        
        for (let i = 1; i < this.points3d.length; i++)
        {
            let delta = this.points3d[i].sub(this.points3d[0]);
            this.points2d.push(new vec2(delta.dot(this.ox2), delta.dot(this.oy2)));
        }
    }

    // check intersection between polygon and interval(pos1, pos2)
    isIntersect( pos1, pos2 )
    {
        let dir = pos2.sub(pos1);
        if (Math.abs((dir.norm()).dot(this.normal)) < 0.00001)  // parallel
            return [0, new vec3()];
        let t = (this.points3d[0].sub(pos1)).dot(this.normal) / (dir.dot(this.normal));
        if (t < 0 || t > 1)
            return [0, new vec3()];

        let InterPoint = pos1.add(dir.mulN(t));
        let interPosRel = pos1.add(dir.mulN(t)).sub(this.points3d[0]);

        let intersectionCounter = 0;

        let ps = new vec2(interPosRel.dot(this.ox2), interPosRel.dot(this.oy2));
        let dire = ps;
        for (let i = 2; i < this.points2d.length; i++)
        {
            let p1 = this.points2d[i - 1];
            let p2 = this.points2d[i];
            let dp = p2.sub(p1);
            let d = -dp.y * dire.x + dire.y * dp.x;
            let t1 = ( (ps.x - p1.x) * dp.y + (p1.y - ps.y) * dp.x ) / d;
            let t2 = ( dire.x * (p1.y - ps.y) - dire.y * (p1.x - ps.x) ) / d;
            intersectionCounter += t1 > 0 && t2 >= 0 && t2 < 1;            
        }
        return [intersectionCounter % 2, InterPoint];
    }

    createIndicesAndVertices( indices, vertices )
    {
        for (let pos of this.points3d)
        {
            vertices.push(pos.x);
            vertices.push(pos.y);
            vertices.push(pos.z);
        }
        for (let pos of this.points3d)
        {
            let tmp = pos.sub(this.normal.mulN(0.01));
            vertices.push(tmp.x);
            vertices.push(tmp.y);
            vertices.push(tmp.z);
        }
        for (let i = 2; i < this.points3d.length; i++)
        {
            indices.push(0);
            indices.push(i - 1);
            indices.push(i);

            indices.push(this.points3d.length);
            indices.push(this.points3d.length + i);
            indices.push(this.points3d.length + i - 1);
        }

    
    } 

}