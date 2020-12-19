const main = () => {
    const canvas = document.getElementById('myCanvas');
    const gl = canvas.getContext('webgl');

    const vertices = [
        -0.5, -0.5, 1.0, 0.0, 0.0, 
        0.5, -0.5, 0.0, 1.0, 0.0,  
        0.5, 0.5, 0.0, 0.0, 1.0, 
        -0.5, -0.5, 1.0, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0, 1.0, 
        -0.5, 0.5, 1.0, 1.0, 1.0,
    ];  

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const [vertexShaderSource, fragmentShaderSource] = createVertexAndFragmentSource();
    const [vertexShader, fragmentShader] = createVertexAndFragmentShader(gl,vertexShaderSource, fragmentShaderSource);
    //compile.c to become .o
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    //prepare "wadah" for become .exe(shader program)
    const shaderProgram = gl.createProgram();

    //put .o to .exe
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    startDrawingUsingShaderProgram(gl, [shaderProgram, vertexBuffer], canvas);
}

const createVertexAndFragmentSource = () =>{
    const vertexShaderSource = document.getElementById('vertexShaderSource').innerText;
    const fragmentShaderSource = document.getElementById('fragmentShaderSource').innerText;

    return [vertexShaderSource, fragmentShaderSource];
}

const createVertexAndFragmentShader = (gl, vertexShaderSource, fragmentShaderSource) => {
    // create .c as GPU
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    return [vertexShader, fragmentShader];
}

const startDrawingUsingShaderProgram = (gl, [shaderProgram, vertexBuffer], canvas) => {
    //connect .o so we can runnable context in .exe file before
    gl.linkProgram(shaderProgram);

    // start using context
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const aPositionLoc = gl.getAttribLocation(shaderProgram, "a_position");
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);

    const aColorLoc = gl.getAttribLocation(shaderProgram, "a_color");
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.viewport(100, 0, canvas.height, canvas.height);
    
    const primitive = gl.TRIANGLES;
    const offset = 0;
    const nVertex = 6;

    let freeze = false;
    const speed = 0.01;

    const modelLoc = gl.getUniformLocation(shaderProgram, 'u_model');
    const viewLoc = gl.getUniformLocation(shaderProgram, 'u_view');
    const projectionLoc = gl.getUniformLocation(shaderProgram, 'u_projection');

    const model = glMatrix.mat4.create();
    const view = glMatrix.mat4.create();
    const projection = glMatrix.mat4.create();
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    const onKeyDown = (event) => {
        if (event.keyCode == 65) {
            glMatrix.mat4.translate(model, model, [-speed, 0.0, 0.0]);
        } // A = 65
        else if (event.keyCode == 68) {
            glMatrix.mat4.translate(model, model, [speed, 0.0, 0.0]);
        } // D = 68
        if (event.keyCode == 87) {
            glMatrix.mat4.translate(model, model, [0.0, speed, 0.0]);
        } // W = 87
        if (event.keyCode == 83) {
            glMatrix.mat4.translate(model, model, [0.0, -speed, 0.0]);
        } // S = 83
    }

    document.addEventListener('keydown', onKeyDown);


    const render = () => {
        gl.uniformMatrix4fv(modelLoc, false, model);
        gl.uniformMatrix4fv(viewLoc, false, view);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(primitive, offset, nVertex);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}