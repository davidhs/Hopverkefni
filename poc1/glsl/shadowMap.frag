// Tells GPU to use lower precision floats.
precision mediump float;

// ======
// MACROS
// ======

#define PI  3.14
#define TAU 6.28

// ========
// VARYINGS
// ========

// The texture coordinates passed in from the vertex shader.
varying vec2 v_TexCoord0;
//varying vec4 vColor;

// ========
// UNIFORMS
// ========

// Our texture
uniform sampler2D u_texture;
uniform vec2 u_resolution;


// =====
// OTHER
// =====

// Alpha threshold for our occlusion map.
const float THRESHOLD = 0.75;

// ====
// MAIN
// ====

void main() {

  const float MAX_ITERATIONS = 1000.0;

  float distance = 1.0;

  for (float y = 0.0; y < MAX_ITERATIONS; y += 1.0) {
    if (y >= u_resolution.y) {
      break;
    }

    vec2 norm = vec2(v_TexCoord0.s, y / u_resolution.y) * 2.0 - 1.0;

    float theta = PI * 1.5 + (norm.x) * PI;
    float r = (1.0 + norm.y) * 0.5;

    // Coord which we will sample from occlusion map
    vec2 coord = vec2(-r * sin(theta), -r * cos(theta)) / 2.0 + 0.5;

    // sample the occlusion map
    vec4 data = texture2D(u_texture, coord);

    // The current distance is how far from the top we've come
    float dst = y / u_resolution.y;

    // If we hit an opaque fragment (occluder), then get the new distance.
    // If the new distance is below the current, then we'll use that for
    // our ray.
    float caster = data.a;

    if (caster > THRESHOLD) {
      distance = min(distance, dst);
      break;
    }
  }

  gl_FragColor = vec4(vec3(distance), 1.0);
}
