precision highp float;

uniform vec2 u_canvasDimensions;

uniform mat4 u_projectionViewMatrix;

attribute vec2 a_textureCoordinates; //coordinates of this vertex into the brush texture

uniform sampler2D u_positionsTexture;

void main () {
    vec3 position = texture2D(u_positionsTexture, a_textureCoordinates).rgb;

    vec4 outPos = u_projectionViewMatrix * vec4(position, 1.0);
    outPos.z = 0.0;

    gl_Position = outPos;
}
