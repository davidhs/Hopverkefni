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

varying vec2 v_TexCoord0;
varying vec4 v_Color;

// ========
// UNIFORMS
// ========

uniform sampler2D u_texture;
uniform vec2 u_resolution;

// =========
// FUNCTIONS
// =========

//sample from the distance map
float sample(vec2 coord, float r) {
  return step(r, texture2D(u_texture, coord).r);
}

// ====
// MAIN
// ====

void main(void) {
  //rectangular to polar
  vec2 norm = v_TexCoord0.st * 2.0 - 1.0;
	float theta = atan(norm.y, norm.x);
	float r = length(norm);
	float coord = (theta + PI) / TAU;

	//the tex coord to sample our 1D lookup texture
	//always 0.0 on y axis
	vec2 tc = vec2(coord, 0.0);

	//the center tex coord, which gives us hard shadows
	float center = sample(vec2(tc.x, tc.y), r);

	//we multiply the blur amount by our distance from center
	//this leads to more blurriness as the shadow "fades away"
	float blur = (1.0 / u_resolution.x)  * smoothstep(0.0, 1.0, r);

	//now we use a simple gaussian blur
	float sum = 0.0;
  sum += sample(vec2(tc.x - 4.0*blur, tc.y), r) * 0.05;
  sum += sample(vec2(tc.x - 3.0*blur, tc.y), r) * 0.09;
  sum += sample(vec2(tc.x - 2.0*blur, tc.y), r) * 0.12;
  sum += sample(vec2(tc.x - 1.0*blur, tc.y), r) * 0.15;

  sum += center * 0.16;

  sum += sample(vec2(tc.x + 1.0*blur, tc.y), r) * 0.15;
  sum += sample(vec2(tc.x + 2.0*blur, tc.y), r) * 0.12;
  sum += sample(vec2(tc.x + 3.0*blur, tc.y), r) * 0.09;
  sum += sample(vec2(tc.x + 4.0*blur, tc.y), r) * 0.05;
	//1.0 -> in light, 0.0 -> in shadow
 	float lit = mix(center, sum, 1.0);

 	//multiply the summed amount by our distance, which gives us a radial falloff
 	//then multiply by vertex (light) color
	 //gl_FragColor = vColor * vec4(vec3(1.0), lit * smoothstep(1.0, 0.0, r));

	// ALpha

 	gl_FragColor = v_Color * vec4(vec3(1.0), sum * smoothstep(1.0, 0.0, r));
}
