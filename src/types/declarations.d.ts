declare module "swagger-jsdoc" {
  interface Options {
    definition: any;
    apis: string[];
    components?: any;
    [key: string]: any;
  }
  const swaggerJsdoc: (options: Options) => any;
  export = swaggerJsdoc;
}

declare module "swagger-ui-express" {
  const serve: any;
  const setup: (spec: any, options?: any, handlers?: any) => any;
  export { serve, setup };
  export default { serve, setup };
}
