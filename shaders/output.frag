precision highp float;

varying vec2 v_coordinates;

uniform sampler2D u_input;

void main () {
    gl_FragColor = texture2D(u_input, v_coordinates);
}
