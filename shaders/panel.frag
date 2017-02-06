precision highp float;

varying vec2 v_coordinates;

uniform sampler2D u_canvasTexture;

uniform vec2 u_canvasResolution;

void main () {
    vec3 color = texture2D(u_canvasTexture, gl_FragCoord.xy / u_canvasResolution).rgb;
    gl_FragColor = vec4(color * 0.3, 1.0);
}
