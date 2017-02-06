//updates velocity with projectedPosition - position

precision highp float;

uniform vec2 u_resolution;

uniform sampler2D u_positionsTexture; 
uniform sampler2D u_projectedPositionsTexture;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;

    vec3 velocity = texture2D(u_projectedPositionsTexture, coordinates).rgb - texture2D(u_positionsTexture, coordinates).rgb;

    gl_FragColor = vec4(velocity, 1.0);
}
