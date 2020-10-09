const main = () => {
    const canvas = document.getElementById('myCanvas');
    const gl = canvas.getContext('webgl');
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

    startDrawingUsingShaderProgram(gl, shaderProgram);
}

const createVertexAndFragmentSource = () =>{
    const vertexShaderSource = `
        void main() {
            gl_PointSize = 100.0;
            gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        void main() {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
    `;

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

const startDrawingUsingShaderProgram = (gl, shaderProgram) => {
    //connect .o so we can runnable context in .exe file before
    gl.linkProgram(shaderProgram);

    // start using context
    gl.useProgram(shaderProgram);

    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
}