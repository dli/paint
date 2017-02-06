precision highp float;

uniform vec2 u_resolution;

uniform sampler2D u_positionsTexture;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;

    vec3 position = texture2D(u_positionsTexture, coordinates).rgb;

    if (position.z < 0.0) position.z *= 0.5;

    gl_FragColor = vec4(position, 1.0);

}
