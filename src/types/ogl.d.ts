declare module 'ogl' {
  export class Renderer {
    constructor(options?: { width?: number; height?: number; dpr?: number; alpha?: boolean; antialias?: boolean })
    gl: WebGL2RenderingContext
    resize(width: number, height: number): void
  }
  export class Triangle {
    constructor(gl: WebGL2RenderingContext)
  }
  export class Program {
    constructor(gl: WebGL2RenderingContext, vertex: string, fragment: string)
    uniforms: Record<string, unknown>
  }
  export class Mesh {
    constructor(gl: WebGL2RenderingContext, options?: { geometry?: Triangle; program?: Program })
    program: Program
    geometry: Triangle
    setVertexTexture(index: number, texture: Texture | null): void
    uniforms: Record<string, unknown>
  }
  export class Texture {
    constructor(gl: WebGL2RenderingContext, options?: { width?: number; height?: number; internalFormat?: number; format?: number; type?: number; minFilter?: number; magFilter?: number; wrapS?: number; wrapT?: number })
  }
}