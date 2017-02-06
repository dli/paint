precision highp float;

attribute vec2 a_position;

varying vec2 v_coordinates; //in ([0, width], [0, height])

uniform vec2 u_resolution;

uniform vec2 u_screenResolution;
uniform vec2 u_position;
uniform vec2 u_dimensions;

void main () {
    v_coordinates = (a_position * 0.5 + 0.5) * u_resolution;

    vec2 screenPosition = u_position + (a_position * 0.5 + 0.5) * u_dimensions;

    gl_Position = vec4((screenPosition / u_screenResolution) * 2.0 - 1.0, 0.0, 1.0);
}
