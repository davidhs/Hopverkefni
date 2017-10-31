'use strict';

/* global  :true */

/* jslint browser: true, devel: true, white: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// Web GL utilities

const glutil = (function () {
  const glutil = {};

  // gl is webgl context
  // type is eg gl.VERTEX_SHADER
  // or gl.FRAGMENT_SHADER
  // source is the text
  glutil.createShader = function (gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
      return shader;
    }
    console.error(
      'ERROR compiling shader!',
      gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    if (false) throw Error();

    return null;
  };

  /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {*} vertexShader
     * @param {*} fragmentShader
     */
  glutil.createProgram = function (gl, vertexShader, fragmentShader, validate) {
    validate = validate || false;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!success) {
      console.error(
        'ERROR linking program!',
        gl.getProgramInfoLog(program),
      );
      gl.deleteProgram(program);
      return null;
    }

    if (validate) {
      const status = glutil.validateProgram(gl, program);
      if (!status) {
        return null;
      }
    }

    return program;
  };

  glutil.setRectangle = function (gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    const positions = [
      x1, y1,
      x2, y1,
      x1, y2,

      x1, y2,
      x2, y1,
      x2, y2,
    ];

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW,
    );
  };

  glutil.validateProgram = function (gl, program) {
    gl.validateProgram(program);
    const ok = gl.getProgramParameter(program, gl.VALIDATE_STATUS);
    if (!ok) {
      console.error(
        'ERROR validating program!',
        gl.getProgramInfoLog(program),
      );
      throw Error();
    }
    return ok;
  };


  glutil.createProgramFromScripts = function (gl, arrVS, arrFS) {
    // TODO: implement remainder

    const vs = arrVS[0];
    const fs = arrFS[0];

    const vertexShader = glutil.createShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = glutil.createShader(gl, gl.FRAGMENT_SHADER, fs);

    const program = glutil.createProgram(gl, vertexShader, fragmentShader);

    return program;
  };

  glutil.createAndSetupTexture = function (gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  };

  return glutil;
}());
