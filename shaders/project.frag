//advects brush positions forward in time

precision highp float;

uniform vec2 u_resolution;

uniform sampler2D u_positionsTexture; 
uniform sampler2D u_velocitiesTexture;
uniform sampler2D u_randomsTexture;

uniform float u_damping;
uniform float u_gravity;

uniform float u_verticesPerBristle;

float random (float n) {
    return fract(0.5 + n * (0.6180339887498949));
}

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;

    vec3 position = texture2D(u_positionsTexture, coordinates).rgb;
    vec3 velocity = texture2D(u_velocitiesTexture, coordinates).rgb;

    velocity *= u_damping;

    velocity += vec3(0.0, 0.0, -u_gravity);

    gl_FragColor = vec4(position + velocity, 1.0);
}
