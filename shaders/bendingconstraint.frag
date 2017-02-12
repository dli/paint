precision highp float;

uniform vec2 u_resolution;

uniform sampler2D u_positionsTexture;
uniform sampler2D u_randomsTexture;

uniform float u_pointCount;
uniform int u_pass; //0, 1 or 2, 0 means we do 0-1-2, 3-4-5, 6-7-8, 1 means we do 1-2-3, 4-5-6, 7-8-9, 2 means we do 2-3-4, 5-6-7, 8-9-10

uniform float u_stiffnessVariation;

float length2(vec3 v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
}

void main () {
    vec2 coordinates = gl_FragCoord.xy / u_resolution;

    float index = gl_FragCoord.y;

    float baseIndex = floor((index - float(u_pass)) / 3.0) * 3.0 + float(u_pass); //the base index of this a, b, c pair

    index = floor(index);

    if (baseIndex >= 0.0 && baseIndex < u_pointCount - 2.0) {
        float aIndex = baseIndex;
        float bIndex = baseIndex + 1.0;
        float cIndex = baseIndex + 2.0;

        vec3 aPos = texture2D(u_positionsTexture, vec2(coordinates.x, (aIndex + 0.5) / u_pointCount)).rgb;
        float aW = 1.0;
        if (aIndex < 0.1) aW = 0.0;

        vec3 bPos = texture2D(u_positionsTexture, vec2(coordinates.x, (bIndex + 0.5) / u_pointCount)).rgb;
        float bW = 1.0;

        vec3 cPos = texture2D(u_positionsTexture, vec2(coordinates.x, (cIndex + 0.5) / u_pointCount)).rgb;
        float cW = 1.0;

        vec3 r1 = (bPos - aPos) / distance(aPos, bPos);
        vec3 r2 = (cPos - bPos) / distance(bPos, cPos);

        float constraint = dot(r1, r2) - 1.0;

        float random = texture2D(u_randomsTexture, vec2(coordinates.x, 0.5 / u_pointCount)).g;
        float stiffness = random * u_stiffnessVariation;

        if (constraint > -1.0) {
            vec3 gradA = (dot(r1, r2) * r1 - r2) / max(distance(aPos, bPos), 0.0001);
            vec3 gradC = (-dot(r1, r2) * r2 + r1) / max(distance(bPos, cPos), 0.0001);
            vec3 gradB = -gradA - gradC;

            float s = stiffness * constraint / max(aW * length2(gradA) + bW * length2(gradB) + cW * length2(gradC), 0.0001);
            vec3 newPosition;
            if (index == aIndex) {
                vec3 currentPosition = aPos;
                newPosition = currentPosition - s * gradA * aW;
            } else if (index == bIndex) {
                vec3 currentPosition = bPos;
                newPosition = currentPosition - s * gradB * bW;
            } else if (index == cIndex) {
                vec3 currentPosition = cPos;
                newPosition = currentPosition - s * gradC * cW;
            }

            gl_FragColor = vec4(newPosition, 0.0);
        } else {
            gl_FragColor = texture2D(u_positionsTexture, coordinates).rgba;
        }
    } else {
        gl_FragColor = texture2D(u_positionsTexture, coordinates).rgba;
    }
}
