precision highp float;

varying vec2 v_coordinates; //in [-1, 1]

uniform vec4 u_currentHSVA;

uniform float u_innerRadius;
uniform float u_outerRadius;
uniform float u_squareWidth;

uniform vec2 u_circlePosition;

uniform vec2 u_alphaSliderPosition; //bottom left of alpha bar
uniform vec2 u_alphaSliderDimensions;

const float PI = 3.14159265;

vec3 trilinearInterpolate(vec3 p, vec3 v000, vec3 v100, vec3 v010, vec3 v001, vec3 v101, vec3 v011, vec3 v110, vec3 v111) {
    return v000 * (1.0 - p.x) * (1.0 - p.y) * (1.0 - p.z) +
           v100 * p.x * (1.0 - p.y) * (1.0 - p.z) +
           v010 * (1.0 - p.x) * p.y * (1.0 - p.z) +
           v001 * (1.0 - p.x) * (1.0 - p.y) * p.z +
           v101 * p.x * (1.0 - p.y) * p.z +
           v011 * (1.0 - p.x) * p.y * p.z +
           v110 * p.x * p.y * (1.0 - p.z) +
           v111 * p.x * p.y * p.z;
}

vec3 rybToRgb(vec3 ryb) {
#ifdef RGB
    return 1.0 - ryb.yxz;
#endif

    return trilinearInterpolate(ryb, 
        vec3(1.0, 1.0, 1.0), 
        vec3(1.0, 0.0, 0.0), 
        vec3(0.163, 0.373, 0.6), 
        vec3(1.0, 1.0, 0.0), 
        vec3(1.0, 0.5, 0.0), 
        vec3(0.0, 0.66, 0.2),
        vec3(0.5, 0.0, 0.5),
        vec3(0.2, 0.094, 0.0));
}

vec3 hsv2ryb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsvToRgb (vec3 hsv) {
    return rybToRgb(hsv2ryb(hsv));
}

float circleStrokeAlpha (vec2 position, vec2 center, float innerRadius, float outerRadius, float feather) {
    float dist = distance(center, position);
    return smoothstep(innerRadius - feather, innerRadius, dist) * smoothstep(outerRadius + feather, outerRadius, dist);
}

vec4 hueCircle () {
    vec2 coordinates = v_coordinates - u_circlePosition;

    float angle = atan(coordinates.y, coordinates.x) + 2.0 * PI;
    float hue = angle / (2.0 * PI);
    
    vec3 circleRGB = hsvToRgb(vec3(hue, 1.0, 1.0));

    float radius = length(coordinates);
    float circleAlpha = circleStrokeAlpha(coordinates, vec2(0.0, 0.0), u_innerRadius, u_outerRadius, 1.5);

    return vec4(circleRGB, circleAlpha);
}

float boxAlpha (vec2 position, vec2 bottomLeft, vec2 dimensions, vec2 feather) {
    vec2 center = bottomLeft + dimensions * 0.5;
    vec2 distances = max(abs(position - center) - dimensions * 0.5, vec2(0.0, 0.0));

    return smoothstep(feather.x, 0.0, distances.x) * smoothstep(feather.y, 0.0, distances.y);
}

float boxStrokeAlpha (vec2 position, vec2 bottomLeft, vec2 dimensions, vec2 strokeWidth, vec2 feather) {
    return boxAlpha(position, bottomLeft - strokeWidth * 0.5, dimensions + strokeWidth, feather) *
           (1.0 - boxAlpha(position, bottomLeft + strokeWidth * 0.5, dimensions - strokeWidth, feather));
}

vec4 sbSquare () {
    vec2 coordinates = v_coordinates - u_circlePosition;

    float saturation = clamp((coordinates.x - (-u_squareWidth / 2.0)) / u_squareWidth, 0.0, 1.0);
    float lightness = clamp((coordinates.y - (-u_squareWidth / 2.0)) / u_squareWidth, 0.0, 1.0);

    vec3 squareRYB = hsv2ryb(vec3(u_currentHSVA.x, saturation, lightness));
    vec3 squareRGB = rybToRgb(squareRYB);

    float squareAlpha = boxAlpha(coordinates, vec2(-u_squareWidth * 0.5), vec2(u_squareWidth), vec2(0.05));

    return vec4(squareRGB, squareAlpha);
}


vec4 hueIndicator () {
    float hueIndicatorAngle = u_currentHSVA.x * PI * 2.0;

    vec2 coordinates = v_coordinates - u_circlePosition;
    float angle = atan(coordinates.y, coordinates.x);


    float relativeAngle = angle - hueIndicatorAngle; //angle relative to the hue indicator
    if (relativeAngle > PI) relativeAngle -= 2.0 * PI;
    if (relativeAngle < -PI) relativeAngle += 2.0 * PI;

    float indicatorWidth = 0.2;

    float radius = length(coordinates);

    float strokeWidth = 3.0;
    float strokeFeather = 1.5;

    float alpha = boxStrokeAlpha(vec2(radius, relativeAngle), vec2(u_innerRadius, -indicatorWidth * 0.5), vec2(u_outerRadius - u_innerRadius, indicatorWidth), vec2(strokeWidth, strokeWidth / u_innerRadius), vec2(strokeFeather, strokeFeather / u_innerRadius));

    return vec4(1.0, 1.0, 1.0, alpha);
}


vec4 sbIndicator () {
    float innerRadius = 8.0;

    vec2 indicatorPosition = vec2(
        u_circlePosition.x - u_squareWidth * 0.5 + innerRadius + u_currentHSVA.y * (u_squareWidth - innerRadius * 2.0),
        u_circlePosition.y - u_squareWidth * 0.5 + innerRadius + u_currentHSVA.z * (u_squareWidth - innerRadius * 2.0));

    float alpha = circleStrokeAlpha(v_coordinates, indicatorPosition, innerRadius, innerRadius + 2.0, 1.5);

    return vec4(1.0, 1.0, 1.0, alpha);
}



vec4 alphaSlider () {
    float feather = 0.5;
    float alpha = smoothstep(u_alphaSliderPosition.x - feather, u_alphaSliderPosition.x, v_coordinates.x) *
                    smoothstep(u_alphaSliderPosition.x + u_alphaSliderDimensions.x + feather, u_alphaSliderPosition.x + u_alphaSliderDimensions.x, v_coordinates.x) *
                    smoothstep(u_alphaSliderPosition.y - feather, u_alphaSliderPosition.y, v_coordinates.y) *
                    smoothstep(u_alphaSliderPosition.y + u_alphaSliderDimensions.y + feather, u_alphaSliderPosition.y + u_alphaSliderDimensions.y, v_coordinates.y);

    float t = (v_coordinates.y - u_alphaSliderPosition.y) / u_alphaSliderDimensions.y;

    vec2 coordinates = v_coordinates - u_alphaSliderPosition;
    coordinates = floor(coordinates / 5.0);
    float checkerboard = mod(coordinates.x + mod(coordinates.y, 2.0), 2.0) * 0.05 + 0.95;

    vec3 color = mix(vec3(checkerboard), hsvToRgb(u_currentHSVA.rgb), (v_coordinates.y - u_alphaSliderPosition.y) / u_alphaSliderDimensions.y);

    return vec4(color, alpha);
}

vec4 alphaIndicator () {
    float indicatorHeight = 15.0;
    float indicatorY = u_alphaSliderPosition.y + u_currentHSVA.a * (u_alphaSliderDimensions.y - indicatorHeight);

    float alpha = boxStrokeAlpha(v_coordinates, vec2(u_alphaSliderPosition.x, indicatorY), vec2(u_alphaSliderDimensions.x, indicatorHeight), vec2(3.0), vec2(0.3));

    return vec4(1.0, 1.0, 1.0, alpha);
}

vec4 alphaBlend (vec4 color, vec4 source) {
    vec4 result = vec4(0.0);
    result.rgb = source.a * source.rgb + (1.0 - source.a) * color.rgb;
    result.a = 1.0 * source.a + (1.0 - source.a) * color.a;

    return result;
}

void main () {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    vec4 sbSquareColor = sbSquare();
    color = alphaBlend(color, sbSquareColor);
    
    vec4 sbIndicatorColor = sbIndicator();
    color = alphaBlend(color, sbIndicatorColor);

    vec4 hueCircleColor = hueCircle();
    color = alphaBlend(color, hueCircleColor);

    vec4 hueIndicatorColor = hueIndicator();
    color = alphaBlend(color, hueIndicatorColor);

    vec4 alphaSliderColor = alphaSlider();
    color = alphaBlend(color, alphaSliderColor);

    vec4 alphaIndicatorColor = alphaIndicator();
    color = alphaBlend(color, alphaIndicatorColor);

    gl_FragColor = color;
}
