precision highp float;

#ifdef VELOCITY
varying vec2 v_previousVelocity;
varying vec2 v_velocity;
uniform float u_velocityScale;
#else
uniform vec4 u_splatColor;
#endif

uniform float u_splatRadius;

varying vec2 v_previousPosition;
varying vec2 v_position;

varying vec2 v_quadPosition;

varying vec2 v_coordinates;

float distanceToLine(vec2 a, vec2 b, vec2 p) {
    float dist = distance(a, b);
    vec2 direction = (b - a) / dist;

    float projectedDistance = dot(p - a, direction);
    projectedDistance = clamp(projectedDistance, 0.0, dist);

    vec2 projectedPosition = a + projectedDistance * direction;

    return distance(p, projectedPosition);
}

vec2 clampVelocity (vec2 vel) {
    float MAX_SPEED = 2.0;

    float speed = length(vel);

    if (speed > MAX_SPEED) {
        vel *= MAX_SPEED / speed;
    }
    
    return vel;
}

void main () {
    float splatDistance = distanceToLine(v_previousPosition, v_position, v_quadPosition);

    float multiplier = max(1.0 - splatDistance / u_splatRadius, 0.0);


#ifdef VELOCITY
    vec2 velocity = mix(v_previousVelocity, v_velocity, v_coordinates.x * 0.5 + 0.5);
    gl_FragColor = vec4(clampVelocity(velocity * u_velocityScale), 0.0, multiplier);
#else
    gl_FragColor = vec4(u_splatColor.rgb, u_splatColor.a * multiplier);
#endif
}
