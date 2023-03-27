import { Method } from './method';

/**
 * This is the definition of a service that can be called by the LLM.
 * The methods are defined by a {@link Method}.
 */
export class Service {
  name: string;
  methods: object = {};
  description?: string;
  keywords?: string[];

  /**
   * @param name The name of the service.
   * @param description A description of the service.
   * @param keywords A number of keywords that describe the service.
   * @example
   * Here's an example of how to create a service:
   * ```ts
   * const hotelService = new Service('hotel', 'A service for hotels', ['hotel', 'reservation']);
   * ```
   */
  constructor(name: string, description?: string, keywords?: string[]) {
    this.name = name;
    this.description = description;
    this.keywords = keywords;
  }

  /**
   * Register a method to the service.
   * @param name The name of the method.
   * @param method The method definition.
   * @example
   * Here's an example of how to register a method:
   * ```ts
   * const reserveHotelRoomMethod: Method<
   *   { beginDate: string; endDate: string },
   *   { orderId: string }
   * > = {
   *   inputDefinition,
   *   outputDefinition,
   *   handler,
   * };
   *
   * const hotelService = new Service('hotel')
   *  .registerMethod('reserveHotelRoom', reserveHotelRoomMethod);
   * ```
   * @see {@link Method}
   * @returns Service with the new method registered. Use this to chain method registrations.
   */
  registerMethod<N extends string, I, O>(name: N, method: Method<I, O>) {
    this.methods = { ...this.methods, [name]: method };
    return this as typeof this & {
      methods: {
        [K in N]: Method<I, O>;
      };
    };
  }
}
