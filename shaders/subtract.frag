precision highp float;

varying vec2 v_coordinates;

uniform vec2 u_resolution;

uniform sampler2D u_pressureTexture;
uniform sampler2D u_velocityTexture;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;
    vec2 delta = 1.0 / u_resolution;

    float center = texture2D(u_pressureTexture, coordinates).r;
    float left = texture2D(u_pressureTexture, coordinates + vec2(-delta.x, 0.0)).r;
    float right = texture2D(u_pressureTexture, coordinates + vec2(delta.x, 0.0)).r;
    float bottom = texture2D(u_pressureTexture, coordinates + vec2(0.0, -delta.y)).r;
    float top = texture2D(u_pressureTexture, coordinates + vec2(0.0, delta.y)).r;

    //compute gradient of pressure
    vec2 gradient = vec2(right - left, top - bottom) / 2.0;

    vec2 currentVelocity = texture2D(u_velocityTexture, coordinates).rg;

    vec2 newVelocity = currentVelocity - gradient;

    gl_FragColor = vec4(newVelocity, 0.0, 0.0);
}
