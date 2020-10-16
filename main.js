const main = () => {
    const canvas = document.getElementById('myCanvas');
    const gl = canvas.getContext('webgl');

    const vertices = [
        -0.5, -0.5, //Titik A
        0.5, -0.5,  //Titik B
        0.5, -0.5,  //Titik B
        0.5, 0.5, //Titik C
        0.5, 0.5, //Titik C
        -0.5, -0.5, //Titik A
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

    startDrawingUsingShaderProgram(gl, [shaderProgram, vertexBuffer]);
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

const startDrawingUsingShaderProgram = (gl, [shaderProgram, vertexBuffer]) => {
    //connect .o so we can runnable context in .exe file before
    gl.linkProgram(shaderProgram);

    // start using context
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const aPositionLoc = gl.getAttribLocation(shaderProgram, "a_position");
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const primitive = gl.LINES;
    const offset = 0;
    const nVertex = 6;
    gl.drawArrays(primitive, offset, nVertex);
}