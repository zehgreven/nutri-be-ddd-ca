export default class Registry {
  private static instance: Registry;
  depencencies: Map<string, any> = new Map();

  public static getInstance(): Registry {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }
    return Registry.instance;
  }

  public register(key: string, value: any): void {
    this.depencencies.set(key, value);
  }

  public get(key: string): any {
    return this.depencencies.get(key);
  }
}

export function inject(name: string) {
  return function (target: any, propertyKey: string) {
    target[propertyKey] = new Proxy(
      {},
      {
        get(target: any, propertyKey: string) {
          const dependency = Registry.getInstance().get(name);
          return dependency[propertyKey];
        },
      },
    );
  };
}
