

precision mediump float;

attribute vec2 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord0;

//uniform mat4 u_projTrans;

varying vec2 vTexCoord0;
//varying vec4 vColor;


uniform vec2 u_bias;

uniform float u_flipY;  // Set 1 to not flip, and -1 to flip.
uniform vec2 u_resolution;

void main() {
    //vColor = vec4(1.0, 0.0, 0.0, 1.0);
    vTexCoord0 = a_texCoord0;

    //gl_Position = u_projTrans * a_position;


    // ==== Convert to clip space ====

    

    // Convert the position from pixels to [0.0 to 1.0]
    //vec2 zeroToOne = a_position / u_resolution.x;
    //vec2 zeroToOne = a_position / p;
    //vec2 zeroToOne = q;

    vec2 zeroToOne = a_position / u_resolution;

    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // Convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
}
