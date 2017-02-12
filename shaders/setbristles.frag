precision highp float;

uniform vec3 u_brushPosition;
uniform float u_brushScale;
uniform float u_bristleCount;

uniform float u_bristleLength; //length of total bristle
uniform float u_verticesPerBristle;

uniform sampler2D u_randomsTexture;
uniform vec2 u_resolution;

uniform float u_jitter;

const float PHI = 1.618033988749895;
const float PI = 3.14159265;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;

    vec4 randoms = texture2D(u_randomsTexture, coordinates);

    float bristleIndex = floor(gl_FragCoord.x); //which bristle
    float vertexIndex = floor(gl_FragCoord.y);

    //jittered sunflower distribution

    float theta = (bristleIndex + (randoms.z - 0.5) * u_jitter) * 2.0 * PI / (PHI * PHI);
    float r = sqrt(bristleIndex + (randoms.w - 0.5) * u_jitter) / sqrt(u_bristleCount);

    float spacing = u_bristleLength / (u_verticesPerBristle - 1.0);
    vec3 brushSpaceBristlePosition = vec3(r * cos(theta), r * sin(theta), -vertexIndex * spacing);

    vec3 bristlePosition = u_brushPosition + brushSpaceBristlePosition * u_brushScale;

    gl_FragColor = vec4(bristlePosition, 1.0);
}
