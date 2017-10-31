'use strict';

const shadows = (function () {
  const DEBUG = true;

  const canvasOccluders = document.createElement('canvas');
  let ctxOccluders = null;

  let initialized = false;

  const scaler = 0.75;

  const src = {};

  const gShadowMap = {
    canvas: document.createElement('canvas'),
  };

  const gShadowMask = {
    canvas: document.createElement('canvas'),
  };

  function init(glslLights, glslShadowMap, glslShadowMask) {
    src.lights = glslLights;
    src.shadowMap = glslShadowMap;
    src.shadowMask = glslShadowMask;

    ctxOccluders = canvasOccluders.getContext('2d');

    initShadowMap();
    initShadowMask();

    initialized = true;
  }

  function initShadowMap() {
    gShadowMap.gl = gShadowMap.canvas.getContext('webgl');

    const gSMcanvas = gShadowMap.canvas;
    const canvas = gSMcanvas;
    const gSMgl = gShadowMap.gl;
    const gl = gSMgl;
    const vertexShaderSource = src.lights;
    const fragmentShaderSource = src.shadowMap;

    const program = glutil.createProgramFromScripts(
      gl,
      [vertexShaderSource],
      [fragmentShaderSource],
    );

    if (DEBUG) glutil.validateProgram(gl, program);


    gShadowMap.positionLocation = gl.getAttribLocation(program, 'a_position');
    gShadowMap.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord0');
    gShadowMap.a_color = gl.getAttribLocation(program, 'a_color');

    gl.useProgram(program);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,

        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
      ]),
      gl.STATIC_DRAW,
    );


    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const flipYLocation = gl.getUniformLocation(program, 'u_flipY');


    // Turn on the position attribute.
    gl.enableVertexAttribArray(gShadowMap.positionLocation);
    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(gShadowMap.texCoordLocation);

    gShadowMap.resolutionUniformLocation = resolutionUniformLocation;
    gShadowMap.flipYLocation = flipYLocation;

    gShadowMap.texCoordBuffer = texCoordBuffer;


    gShadowMap.texture = glutil.createAndSetupTexture(gl);
    gShadowMap.program = program;
  }

  function initShadowMask() {
    gShadowMask.gl = gShadowMask.canvas.getContext('webgl');

    const gSMcanvas = gShadowMask.canvas;
    const canvas = gSMcanvas;
    const vertexShaderSource = src.lights;
    const fragmentShaderSource = src.shadowMask;

    const gSMgl = gShadowMask.gl;
    const gl = gSMgl;

    const program = glutil.createProgramFromScripts(
      gl,
      [vertexShaderSource],
      [fragmentShaderSource],
    );


    if (DEBUG) glutil.validateProgram(gl, program);


    gShadowMask.texture = glutil.createAndSetupTexture(gl);


    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,

        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
      ]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);


    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord0');
    const a_color = gl.getAttribLocation(program, 'a_color');


    gShadowMask.positionLocation = positionLocation;
    gShadowMask.texCoordLocation = texCoordLocation;
    gShadowMask.a_color = a_color;

    gShadowMask.texCoordBuffer = texCoordBuffer;
    gShadowMask.program = program;
  }


  function getShadowMap(occluders) {
    if (!initialized) return;

    const gSMcanvas = gShadowMap.canvas;
    const canvas = gSMcanvas;
    const gSMgl = gShadowMap.gl;
    const gl = gSMgl;
    const gSMprogram = gShadowMap.program;
    const program = gSMprogram;

    const w = occluders.width;
    const h = occluders.height;

    canvas.width = w;
    canvas.height = h;

    // Look up where the vertex data needs to go.

    // Create a buffer to put 2D clip space points in.
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of ARRAY_BUFFER = positionBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image. (to the buffer)
    glutil.setRectangle(gl, 0, 0, w, h);

    // Provide texture coordinates for the rectangle.

    // Look up uniform locations (get handle of this attribute)

    // Resize canvas
    gl.canvas.width = w;
    gl.canvas.height = 1; // 1D texture

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell position attr. how to get out of positionBuffer.
    gl.vertexAttribPointer(
      gShadowMap.positionLocation, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );


    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, gShadowMap.texCoordBuffer);
    // Tell the textCoord attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      gShadowMap.texCoordLocation, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Set the size of the image.
    gl.uniform2f(gShadowMap.resolutionUniformLocation, w, h);


    gl.bindTexture(gl.TEXTURE_2D, gShadowMap.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, occluders);

    // Flip y coordinate for canvas.
    gl.uniform1f(gShadowMap.flipYLocation, -1);

    // Tell WebGL to render to Canvas instead of framebuffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Tell the shader the resolution of the framebuffer
    gl.uniform2f(gShadowMap.resolutionUniformLocation, w, h);
    // Tell WebGL the viewport setting needed for framebuffer.
    gl.viewport(0, 0, w, h);


    // Draw rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return canvas;
  }


  function getShadowMask(cfg) {
    if (!initialized) return;

    cfg.x = cfg.x || 0;
    cfg.y = cfg.y || 0;
    cfg.w = cfg.w || 0;
    cfg.h = cfg.h || 0;
    cfg.scaler = cfg.scaler || 1;

    const occluders = cfg.occluder;


    const x = -cfg.x + (cfg.w / 2);
    const y = -cfg.y + (cfg.h / 2);

    const _s = Math.max(occluders.width, occluders.height);

    const w = occluders.width;
    const h = occluders.height;

    const targetWidth = scaler * occluders.width;
    const targetHeight = scaler * occluders.height;

    canvasOccluders.width = targetWidth;
    canvasOccluders.height = targetHeight;

    ctxOccluders.drawImage(occluders, scaler * x, scaler * y, targetWidth, targetHeight);

    const shadowMap = getShadowMap(canvasOccluders);

    const gSMcanvas = gShadowMask.canvas;
    const canvas = gSMcanvas;
    const gSMgl = gShadowMask.gl;
    const gl = gSMgl;
    const gSMprogram = gShadowMask.program;
    const program = gSMprogram;
    const tex = gShadowMask.texture;


    canvas.width = w;
    canvas.height = h;

    // Look up where the vertex data needs to go.

    // Create a buffer to put 2D clip space points in.
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of ARRAY_BUFFER = positionBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image. (to the buffer)
    glutil.setRectangle(gl, 0, 0, w, h);

    // Provide texture coordinates for the rectangle.

    // Texture 0: original image


    // Look up uniform locations (get handle of this attribute)
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const flipYLocation = gl.getUniformLocation(program, 'u_flipY');

    // Resize canvas
    gl.canvas.width = w;
    gl.canvas.height = h;

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Turn on the position attribute.
    gl.enableVertexAttribArray(gShadowMask.positionLocation);
    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(gShadowMask.texCoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell position attr. how to get out of positionBuffer.
    gl.vertexAttribPointer(
      gShadowMask.positionLocation, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, gShadowMask.texCoordBuffer);
    // Tell the textCoord attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      gShadowMask.texCoordLocation, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Set the size of the image.
    gl.uniform2f(resolutionUniformLocation, w, h);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shadowMap);

    // Flip y coordinate for canvas.
    gl.uniform1f(flipYLocation, 1);

    // Tell WebGL to render to Canvas instead of framebuffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Tell the shader the resolution of the framebuffer
    gl.uniform2f(resolutionUniformLocation, w, h);


    // Tell WebGL the viewport setting needed for framebuffer.
    gl.viewport(0, 0, w, h);

    // Draw rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);


    return {
      canvas,
      dx: -x,
      dy: -y,
    };
  }

  return {
    getShadowMask,
    init,
  };
}());
