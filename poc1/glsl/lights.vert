// Tells GPU to use lower precision floats.
precision mediump float;

// ==========
// ATTRIBUTES
// ==========

attribute vec2 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord0;

// ========
// VARYINGS
// ========

varying vec2 v_TexCoord0;

// ========
// UNIFORMS
// ========

uniform float u_flipY;  // Set 1 to not flip, and -1 to flip.
uniform vec2  u_resolution;

void main() {

  v_TexCoord0 = a_texCoord0;

  vec2 zeroToOne = a_position / u_resolution;

  // Convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // Convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
}
