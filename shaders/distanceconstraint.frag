precision highp float;

uniform int u_pass; //0 or 1, in pass 0 we do 0-1, 2-3, 4-5..., in pass 1 we do 1-2, 3-4, 5-6...

uniform vec2 u_resolution;

uniform sampler2D u_positionsTexture;
uniform float u_pointCount;

uniform float u_targetDistance;

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;

    float index = floor(gl_FragCoord.y); //which vertex on the bristle

    float myWeight = 1.0;
    if (index < 0.1) myWeight = 0.0;

    vec3 myPosition = texture2D(u_positionsTexture, vec2(coordinates.x, (index + 0.5) / u_pointCount)).rgb;

    float otherIndex = 0.0;

    if (mod(index, 2.0) < 0.01) {
        if (u_pass == 0) {
            otherIndex = index + 1.0;
        } else {
            otherIndex = index - 1.0;
        }
    } else {
        if (u_pass == 0) {
            otherIndex = index - 1.0;
        } else {
            otherIndex = index + 1.0;
        }
    }

    float otherWeight = 1.0;
    if (otherIndex < 0.1) otherWeight = 0.0;

    vec3 newPosition = myPosition;

    if (otherIndex >= 0.0 && otherIndex < u_pointCount) {
        vec3 otherPosition = texture2D(u_positionsTexture, vec2(coordinates.x, (otherIndex + 0.5) / u_pointCount)).rgb;

        float currentDistance = distance(myPosition, otherPosition);
        vec3 towards = (otherPosition - myPosition) / max(currentDistance, 0.01);

        newPosition = myPosition + (myWeight / (myWeight + otherWeight)) * (currentDistance - u_targetDistance) * towards;
    } 

    gl_FragColor = vec4(newPosition, 1.0);

}
