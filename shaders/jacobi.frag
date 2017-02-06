precision highp float;

varying vec2 v_coordinates;

uniform vec2 u_resolution;

uniform sampler2D u_pressureTexture;
uniform sampler2D u_divergenceTexture;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;
    vec2 delta = 1.0 / u_resolution;

    float divergenceCenter = texture2D(u_divergenceTexture, coordinates).r;

    float center = texture2D(u_pressureTexture, coordinates).r;
    float left = texture2D(u_pressureTexture, coordinates + vec2(-delta.x, 0.0)).r;
    float right = texture2D(u_pressureTexture, coordinates + vec2(delta.x, 0.0)).r;
    float bottom = texture2D(u_pressureTexture, coordinates + vec2(0.0, -delta.y)).r;
    float top = texture2D(u_pressureTexture, coordinates + vec2(0.0, delta.y)).r;

    float newPressure = (left + right + bottom + top - divergenceCenter) / 4.0;

    gl_FragColor = vec4(newPressure, 0.0, 0.0, 0.0);
}
