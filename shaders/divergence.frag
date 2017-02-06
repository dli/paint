precision highp float;

varying vec2 v_coordinates;

uniform sampler2D u_velocityTexture;

uniform vec2 u_resolution;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;
    vec2 delta = 1.0 / u_resolution;

    vec2 left = texture2D(u_velocityTexture, coordinates + vec2(-delta.x, 0.0)).rg;
    vec2 right = texture2D(u_velocityTexture, coordinates + vec2(delta.x, 0.0)).rg;
    vec2 bottom = texture2D(u_velocityTexture, coordinates + vec2(0.0, -delta.y)).rg;
    vec2 top = texture2D(u_velocityTexture, coordinates + vec2(0.0, delta.y)).rg;

    float divergence = ((right.x - left.x) + (top.y - bottom.y)) / 2.0;

    gl_FragColor = vec4(divergence, 0.0, 0.0, 0.0);
}
