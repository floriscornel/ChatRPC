import { Method } from './method';

/**
 * This is the definition of a service that can be called by the LLM.
 * The methods are defined by a {@link Method}. The services can be added to a {@link Chat}.
 * @example
 * Here's an example of how to create a service:
 * ```ts
 * const hotelService = new Service({
 *   name: 'hotel',
 *   description: 'A service for hotels',
 *   keywords: ['hotel', 'reservation'],
 * });
 * ```
 *
 */

export class Service {
  private _name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _methods: Record<string, Method<any, any>> = {};
  private _description?: string;
  private _keywords?: string[];

  constructor(config: {
    name: string;
    description?: string;
    keywords?: string[];
  }) {
    this._name = config.name;
    this._description = config.description;
    this._keywords = config.keywords;
  }

  /**
   * Register a method to the service.
   * @example
   * Here's an example of how to register a method:
   * ```ts
   * const reserveHotelRoomMethod = new Method({
   *   input: {
   *     type: 'object',
   *     properties: { beginDate: {type:'string'}, endDate: {type:'string'} },
   *   },
   *   output: { type: 'object', properties: { orderId: {type:'string'} } },
   *   handler: async (input: { beginDate: string; endDate: string }) => {
   *     return { orderId: '123' };
   *   },
   * });
   * const hotelService = new Service({ name: 'hotel' })
   *   .registerMethod('reserveHotelRoom', reserveHotelRoomMethod);
   * hotelService.reserveHotelRoom.handler({
   *   beginDate: '2020-01-01', endDate: '2020-01-02'
   * });
   * ```
   * @param name The name of the method. It should be unique within the service and not be a reserved name.
   * @param method The method to register.
   * @see {@link Method}
   * @returns Service with the new method registered. Use this to chain method registrations.
   */
  registerMethod<N extends string, I, O>(
    name: N & (N extends keyof Service ? never : N),
    method: Method<I, O>,
  ) {
    if (name in this) {
      throw new Error(`Method name "${name}" is reserved and cannot be used.`);
    }
    this._methods = { ...this._methods, [name]: method };
    return new Proxy<Service>(this, {
      get(target, prop, receiver) {
        // for existing keys in _methods, return the method
        if (typeof prop === 'string' && prop in target._methods) {
          return target._methods[prop];
        }
        // otherwise return the value from the original object
        return Reflect.get(target, prop, receiver);
      },
    }) as typeof this & {
      [K in N]: Method<I, O>;
    };
  }

  /**
   * Get a method by name.
   * @param name The name of the method.
   * @returns The method or undefined if it doesn't exist.
   * @see {@link Method}
   * @example
   * Here's an example of how to get a method:
   * ```ts
   * hotelService.getMethod('reserveHotelRoom');
   * ```
   */
  getMethod(name: string): Method<unknown, unknown> | undefined {
    return this._methods[name];
  }

  describe(): object {
    const methods: Record<string, object> = {};
    for (const [name, method] of Object.entries(this._methods)) {
      methods[name] = method.describe();
    }
    // Deep clone the object to prevent accidental mutation.
    return JSON.parse(
      JSON.stringify({
        description: this._description,
        keywords: this._keywords,
        methods,
      }),
    );
  }

  get name(): string {
    return this._name;
  }
}
