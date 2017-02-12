precision highp float;

varying vec2 v_coordinates;

uniform sampler2D u_paintTexture;

uniform vec2 u_paintingSize; //painting size in pixels
uniform vec2 u_paintingPosition; //bottom left position in pixels
uniform vec2 u_paintingResolution;

uniform float u_normalScale;

uniform vec3 u_lightDirection;
uniform float u_roughness;
uniform float u_F0;
uniform float u_diffuseScale;
uniform float u_specularScale;

#ifdef RESIZING
uniform float u_featherSize;
#endif

vec3 rybToRgb(vec3 ryb) {
    float r = ryb.x;
    float y = ryb.y;
    float b = ryb.z;

    // remove brightness/whiteness
    float w = min(min(r, y), b);
    r -= w;
    y -= w;
    b -= w;

    float my = max(max(r, y), b);

    // get the green out of the yellow and blue
    float g = min(y, b);
    y -= g;
    b -= g;

    if (b != 0.0 && g != 0.0) {
        b *= 2.0;
        g *= 2.0;
    }

    // redistribute the remaining yellow
    r += y;
    g += y;

    // Create the final vector
    vec3 rgb = vec3(r, g, b);

    // normalize to values
    float mg = max(max(r, g), b);
    if(mg != 0.0) {
        float n = my / mg;
        rgb *= n;
    }
    rgb += w;

    return 1.0 - rgb;
}

//samples with feathering at the edges
vec4 samplePaintTexture (vec2 coordinates) {
    vec4 value = texture2D(u_paintTexture, coordinates);

#ifdef RESIZING
    vec2 featherSize = u_featherSize / u_paintingResolution;
    float scale = smoothstep(-featherSize.x, 0.0, coordinates.x) * smoothstep(-featherSize.y, 0.0, coordinates.y)
                  * smoothstep(1.0 + featherSize.x, 1.0, coordinates.x) * smoothstep(1.0 + featherSize.y, 1.0, coordinates.y);
    return value * scale;
#else
    return value;
#endif
}

float getHeight (vec2 coordinates) {
    return samplePaintTexture(coordinates).a;
}


vec2 computeGradient(vec2 coordinates) { //sobel operator
    vec2 delta = 1.0 / u_paintingResolution;

    float topLeft = getHeight(coordinates + vec2(-delta.x, delta.y));
    float top = getHeight(coordinates + vec2(0.0, delta.y));
    float topRight = getHeight(coordinates + vec2(delta.x, delta.y));

    float left = getHeight(coordinates + vec2(-delta.x, 0.0));
    float right = getHeight(coordinates + vec2(delta.x, 0.0));

    float bottomLeft = getHeight(coordinates + vec2(-delta.x, -delta.y));
    float bottom = getHeight(coordinates + vec2(0.0, -delta.y));
    float bottomRight = getHeight(coordinates + vec2(delta.x, -delta.y));

    return vec2(
         1.0 * topLeft - 1.0 * topRight + 2.0 * left - 2.0 * right + 1.0 * bottomLeft - 1.0 * bottomRight,
        -1.0 * topLeft + 1.0 * bottomLeft - 2.0 * top + 2.0 * bottom - 1.0 * topRight + 1.0 * bottomRight);
}


const float PI = 3.14159265;

float square (float x) {
    return x * x;
}

float fresnel (float F0, float lDotH) {
    float f = pow(1.0 - lDotH, 5.0);

    return (1.0 - F0) * f + F0;
}

float GGX (float alpha, float nDotH) {
    float a2 = square(alpha);

    return a2 / (PI * square(square(nDotH) * (a2 - 1.0) + 1.0));
}

float GGGX (float alpha, float nDotL, float nDotV) {
    float a2 = square(alpha);

    float gl = nDotL + sqrt(a2 + (1.0 - a2) * square(nDotL));
    float gv = nDotV + sqrt(a2 + (1.0 - a2) * square(nDotV));

    return 1.0 / (gl * gv);
}

float saturate (float x) {
    return clamp(x, 0.0, 1.0);
}

float specularBRDF (vec3 lightDirection, vec3 eyeDirection, vec3 normal, float roughness, float F0) {
    vec3 halfVector = normalize(lightDirection + eyeDirection);

    float nDotH = saturate(dot(normal, halfVector));
    float nDotL = saturate(dot(normal, lightDirection));
    float nDotV = saturate(dot(normal, eyeDirection));
    float lDotH = saturate(dot(lightDirection, halfVector));

    float D = GGX(roughness, nDotH);
    float G = GGGX(roughness, nDotL, nDotV);
    float F = fresnel(F0, lDotH);

    return D * G * F;
}

void main () {
#ifdef SAVE
    vec2 coordinates = vec2(v_coordinates.x, 1.0 - v_coordinates.y);
#else
    vec2 coordinates = (gl_FragCoord.xy - u_paintingPosition) / u_paintingSize;
#endif

    vec4 value = samplePaintTexture(coordinates); //r, g, b, height

    vec2 gradient = computeGradient(coordinates);
    vec3 normal = normalize(vec3(
        gradient.x,
        gradient.y,
        u_normalScale
    ));

    vec3 lightDirection = normalize(u_lightDirection);
    vec3 eyeDirection = vec3(0.0, 0.0, 1.0);

    float diffuse = saturate(dot(lightDirection, normal));
    diffuse = diffuse * u_diffuseScale + (1.0 - u_diffuseScale);


    float specular = specularBRDF(lightDirection, eyeDirection, normal, u_roughness, u_F0);

    vec3 color = rybToRgb(value.rgb);

    vec3 surfaceColor = color * diffuse + specular * u_specularScale;

    gl_FragColor = vec4(surfaceColor, 1.0);
}
