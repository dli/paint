precision highp float;

//this shader works in window coordinates

//dimensions of box casting the shadow in window coordinates
uniform vec2 u_bottomLeft;
uniform vec2 u_topRight;

uniform float u_alpha;
uniform float u_sigma;

vec4 erf(vec4 x) {
    vec4 s = sign(x), a = abs(x);
    x = 1.0 + (0.278393 + (0.230389 + 0.078108 * (a * a)) * a) * a;
    x *= x;
    return s - s / (x * x);
}

// Return the mask for the shadow of a box from lower to upper
float boxShadow(vec2 lower, vec2 upper, vec2 point, float sigma) {
    vec4 query = vec4(point - lower, point - upper);
    vec4 integral = 0.5 + 0.5 * erf(query * (sqrt(0.5) / sigma));
    return (integral.z - integral.x) * (integral.w - integral.y);
}


void main () {
    vec2 coordinates = gl_FragCoord.xy;

    float shadow = boxShadow(u_bottomLeft, u_topRight, coordinates, u_sigma);
    gl_FragColor = vec4(vec3(0.0), shadow * u_alpha);
}
