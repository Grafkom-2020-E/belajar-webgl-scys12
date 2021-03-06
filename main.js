const main = () => {
    const canvas = document.getElementById('myCanvas');
    const gl = canvas.getContext('webgl');

    const vertices = [];  
    const cubePoints = [
        [-0.5,  0.5,  0.5],   // A, 0
        [-0.5, -0.5,  0.5],   // B, 1
   	    [ 0.5, -0.5,  0.5],   // C, 2 
   	    [ 0.5,  0.5,  0.5],   // D, 3
        [-0.5,  0.5, -0.5],   // E, 4
  	    [-0.5, -0.5, -0.5],   // F, 5
  	    [ 0.5, -0.5, -0.5],   // G, 6
        [ 0.5,  0.5, -0.5]    // H, 7 
    ];

    const cubeColors = [
        [],
        [1.0, 0.0, 0.0],    // merah
        [1.0, 0.0, 0.0],    // merah
        [1.0, 0.0, 0.0],    // merah
        [1.0, 0.0, 0.0],    // merah
        [1.0, 0.0, 0.0],    // merah
        [1.0, 0.0, 0.0],    // merah
        // [0.0, 1.0, 0.0],    // hijau
        // [0.0, 0.0, 1.0],    // biru
        // [1.0, 1.0, 1.0],    // putih
        // [1.0, 0.5, 0.0],    // oranye
        // [1.0, 1.0, 0.0],    // kuning
        []
    ];

    const cubeNormals = [
        [],
        [0.0, 0.0, 1.0],    // depan
        [1.0, 0.0, 0.0],    // kanan
        [0.0, 1.0, 0.0],    // atas
        [-1.0, 0.0, 0.0],   // kiri
        [0.0, 0.0, -1.0],   // belakang
        [0.0, -1.0, 0.0],   // bawah
        []
    ];
    
    const quad = (a, b, c, d) => {
        const indices = [a, b, c, c, d, a];
        for (let i=0; i<indices.length; i++) {
            const point = cubePoints[indices[i]];  // [x, y, z]
            for (let j=0; j<point.length; j++) {
                vertices.push(point[j]);
            }
            const color = cubeColors[a]; // [r, g, b]
            for (let j=0; j<color.length; j++) {
                vertices.push(color[j]);
            }
            const normal = cubeNormals[a];
            for (let j=0; j<normal.length; j++) {
                vertices.push(normal[j]);
            }            
        }
    }
    quad(1, 2, 3, 0); // DEPAN, merah
    quad(2, 6, 7, 3); // KANAN, hijau
    quad(3, 7, 4, 0); // ATAS, biru
    quad(4, 5, 1, 0); // KIRI, putih
    quad(5, 4, 7, 6); // BELAKANG, oranye
    quad(6, 2, 1, 5); // BAWAH, kuning

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
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);

    const aColorLoc = gl.getAttribLocation(shaderProgram, "a_color");
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    const aNormalLoc = gl.getAttribLocation(shaderProgram, "a_normal");
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);
    gl.enableVertexAttribArray(aNormalLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.viewport(100, 0, canvas.height, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    
    const primitive = gl.TRIANGLES;
    const offset = 0;
    const nVertex = 36;

    let freeze = false;
    const linearSpeed = 0.01;
    const angularSpeed = glMatrix.glMatrix.toRadian(1);

    const modelLoc = gl.getUniformLocation(shaderProgram, 'u_model');
    const viewLoc = gl.getUniformLocation(shaderProgram, 'u_view');
    const projectionLoc = gl.getUniformLocation(shaderProgram, 'u_projection');

    const model = glMatrix.mat4.create();
    const view = glMatrix.mat4.create();
    const projection = glMatrix.mat4.create();
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    const onKeyDown = (event) => {
        if (event.keyCode == 65) {
            glMatrix.mat4.translate(model, model, [-linearSpeed, 0.0, 0.0]);
        } // A = 65
        else if (event.keyCode == 68) {
            glMatrix.mat4.translate(model, model, [linearSpeed, 0.0, 0.0]);
        } // D = 68
        if (event.keyCode == 87) {
            glMatrix.mat4.translate(model, model, [0.0, linearSpeed, 0.0]);
        } // W = 87
        if (event.keyCode == 83) {
            glMatrix.mat4.translate(model, model, [0.0, -linearSpeed, 0.0]);
        } // S = 83
    }
    document.addEventListener('keydown', onKeyDown);
    
    const uNormalModel = gl.getUniformLocation(shaderProgram, 'u_normalModel');
    const uAmbientColor = gl.getUniformLocation(shaderProgram, 'u_ambientColor');
    gl.uniform3fv(uAmbientColor, [0.5, 0.5, 0.5]);
    const uLightColor = gl.getUniformLocation(shaderProgram, 'u_lightColor');
    gl.uniform3fv(uLightColor, [1, 1, 1]);
    const uLightPosition = gl.getUniformLocation(shaderProgram, 'u_lightPosition');
    gl.uniform3fv(uLightPosition, [2, -3, 3]);

    const render = () => {
        glMatrix.mat4.rotate(model, model, angularSpeed, [1.0, 1.0, 1.0]);
        gl.uniformMatrix4fv(modelLoc, false, model);
        gl.uniformMatrix4fv(viewLoc, false, view);
        const normalModel = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalModel, model);
        gl.uniformMatrix3fv(uNormalModel, false, normalModel);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(primitive, offset, nVertex);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}