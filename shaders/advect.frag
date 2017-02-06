precision highp float;

varying vec2 v_coordinates;

uniform sampler2D u_velocityTexture;
uniform sampler2D u_inputTexture;

uniform float u_deltaTime;
uniform float u_dissipation;

uniform vec2 u_resolution;

uniform vec2 u_min;
uniform vec2 u_max;

void main () {
    //RK2

    vec2 coordinates = gl_FragCoord.xy;
    vec2 velocity = texture2D(u_velocityTexture, coordinates / u_resolution).rg * 100.0;

    vec2 halfCoordinates = coordinates - velocity * 0.5 * u_deltaTime;
    vec2 halfVelocity = texture2D(u_velocityTexture, clamp(halfCoordinates, u_min, u_max) / u_resolution).rg * 100.0;

    vec2 finalCoordinates = coordinates - halfVelocity * u_deltaTime;

    gl_FragColor = texture2D(u_inputTexture, clamp(finalCoordinates, u_min, u_max) / u_resolution) * u_dissipation;
}
