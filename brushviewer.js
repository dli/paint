var BrushViewer = (function () {
    'use strict';


    function makePerspectiveMatrix (out, fovy, aspect, near, far) {
        var f = 1.0 / Math.tan(fovy / 2),
            nf = 1 / (near - far);

        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;
        return out;
    }

    function makeIdentityMatrix (matrix) {
        matrix[0] = 1.0;
        matrix[1] = 0.0;
        matrix[2] = 0.0;
        matrix[3] = 0.0;
        matrix[4] = 0.0;
        matrix[5] = 1.0;
        matrix[6] = 0.0;
        matrix[7] = 0.0;
        matrix[8] = 0.0;
        matrix[9] = 0.0;
        matrix[10] = 1.0;
        matrix[11] = 0.0;
        matrix[12] = 0.0;
        matrix[13] = 0.0;
        matrix[14] = 0.0;
        matrix[15] = 1.0;
        return matrix;
    }

    function premultiplyMatrix (out, matrixA, matrixB) { //out = matrixB * matrixA
        var b0 = matrixB[0], b4 = matrixB[4], b8 = matrixB[8], b12 = matrixB[12],
            b1 = matrixB[1], b5 = matrixB[5], b9 = matrixB[9], b13 = matrixB[13],
            b2 = matrixB[2], b6 = matrixB[6], b10 = matrixB[10], b14 = matrixB[14],
            b3 = matrixB[3], b7 = matrixB[7], b11 = matrixB[11], b15 = matrixB[15],

            aX = matrixA[0], aY = matrixA[1], aZ = matrixA[2], aW = matrixA[3];
        out[0] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[1] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[2] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[3] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        aX = matrixA[4], aY = matrixA[5], aZ = matrixA[6], aW = matrixA[7];
        out[4] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[5] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[6] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[7] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        aX = matrixA[8], aY = matrixA[9], aZ = matrixA[10], aW = matrixA[11];
        out[8] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[9] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[10] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[11] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        aX = matrixA[12], aY = matrixA[13], aZ = matrixA[14], aW = matrixA[15];
        out[12] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[13] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[14] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[15] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        return out;
    }

    function makeXRotationMatrix (matrix, angle) {
        matrix[0] = 1.0;
        matrix[1] = 0.0;
        matrix[2] = 0.0;
        matrix[3] = 0.0;
        matrix[4] = 0.0;
        matrix[5] = Math.cos(angle);
        matrix[6] = Math.sin(angle);
        matrix[7] = 0.0;
        matrix[8] = 0.0;
        matrix[9] = -Math.sin(angle);
        matrix[10] = Math.cos(angle);
        matrix[11] = 0.0;
        matrix[12] = 0.0;
        matrix[13] = 0.0;
        matrix[14] = 0.0;
        matrix[15] = 1.0;
        return matrix;
    }

    function makeYRotationMatrix (matrix, angle) {
        matrix[0] = Math.cos(angle);
        matrix[1] = 0.0;
        matrix[2] = -Math.sin(angle);
        matrix[3] = 0.0;
        matrix[4] = 0.0;
        matrix[5] = 1.0;
        matrix[6] = 0.0;
        matrix[7] = 0.0;
        matrix[8] = Math.sin(angle);
        matrix[9] = 0.0;
        matrix[10] = Math.cos(angle);
        matrix[11] = 0.0;
        matrix[12] = 0.0;
        matrix[13] = 0.0;
        matrix[14] = 0.0;
        matrix[15] = 1.0;
        return matrix;
    }


    function BrushViewer (wgl, brushProgram, left, bottom, width, height) {
        this.wgl = wgl;
        this.brushProgram = brushProgram;

        this.left = left;
        this.bottom = bottom;
        this.width = width;
        this.height = height;

        this.closeupProjectionMatrix = makePerspectiveMatrix(new Float32Array(16), Math.PI / 2.0, this.width / this.height, 1.0, 10000);
    }


    BrushViewer.prototype.draw = function (brushX, brushY, brush) {
        var wgl = this.wgl;

        var xRotationMatrix = new Float32Array(16),
            yRotationMatrix = new Float32Array(16),
            distanceTranslationMatrix = makeIdentityMatrix(new Float32Array(16)),
            orbitTranslationMatrix = makeIdentityMatrix(new Float32Array(16));

        var viewMatrix = new Float32Array(16);
        makeIdentityMatrix(viewMatrix);

        var elevation = -Math.PI / 2;
        var azimuth = 0.0;
        var distance = 120.0;
        var orbitPoint = [brushX, brushY, 60.0];

        makeXRotationMatrix(xRotationMatrix, elevation);
        makeYRotationMatrix(yRotationMatrix, azimuth);
        distanceTranslationMatrix[14] = -distance;
        orbitTranslationMatrix[12] = -orbitPoint[0];
        orbitTranslationMatrix[13] = -orbitPoint[1];
        orbitTranslationMatrix[14] = -orbitPoint[2];


        premultiplyMatrix(viewMatrix, viewMatrix, orbitTranslationMatrix);
        premultiplyMatrix(viewMatrix, viewMatrix, yRotationMatrix);
        premultiplyMatrix(viewMatrix, viewMatrix, xRotationMatrix);
        premultiplyMatrix(viewMatrix, viewMatrix, distanceTranslationMatrix);

        var projectionViewMatrix = premultiplyMatrix(new Float32Array(16), viewMatrix, this.closeupProjectionMatrix);


        var brushDrawState = wgl.createDrawState()
            .bindFramebuffer(null)
            .viewport(this.left, this.bottom, this.width, this.height)

            .vertexAttribPointer(brush.brushTextureCoordinatesBuffer, 0, 2, wgl.FLOAT, wgl.FALSE, 0, 0)

            .useProgram(this.brushProgram)
            .bindIndexBuffer(brush.brushIndexBuffer)

            .uniform4f('u_color', 0.6, 0.6, 0.6, 1.0)
            .uniformMatrix4fv('u_projectionViewMatrix', false, projectionViewMatrix)
            .enable(wgl.DEPTH_TEST)

            .uniformTexture('u_positionsTexture', 0, wgl.TEXTURE_2D, brush.positionsTexture);

        wgl.drawElements(brushDrawState, wgl.LINES, brush.indexCount * brush.bristleCount / brush.maxBristleCount, wgl.UNSIGNED_SHORT, 0);

    };

    return BrushViewer;
}());
