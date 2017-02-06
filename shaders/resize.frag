precision highp float;

uniform sampler2D u_paintTexture;

uniform vec2 u_oldResolution;
uniform vec2 u_offset; //in texels

uniform float u_featherSize;

void main () {
    vec2 coordinates = (gl_FragCoord.xy - u_offset) / u_oldResolution;

    vec4 value = texture2D(u_paintTexture, coordinates);

    vec2 featherSize = u_featherSize / u_oldResolution;
    float scale = smoothstep(-featherSize.x, 0.0, coordinates.x) * smoothstep(-featherSize.y, 0.0, coordinates.y)
                  * smoothstep(1.0 + featherSize.x, 1.0, coordinates.x) * smoothstep(1.0 + featherSize.y, 1.0, coordinates.y);

    gl_FragColor = value * scale;
}
