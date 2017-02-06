precision highp float;

attribute vec2 a_position;

varying vec2 v_coordinates;

void main () {
    v_coordinates = a_position * 0.5 + 0.5;

    gl_Position = vec4(a_position, 0.0, 1.0);
}
