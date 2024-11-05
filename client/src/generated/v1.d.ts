/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Login */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      /** @description Request Body */
      requestBody: {
        content: {
          "application/json": components["schemas"]["Credentials"];
        };
      };
      responses: {
        /** @description Successful */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["User"];
          };
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/register": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Registration */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      /** @description Request Body */
      requestBody: {
        content: {
          "application/json": components["schemas"]["RegistrationCredentials"];
        };
      };
      responses: {
        /** @description Successful Registration */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @example Registration Sucessful */
              message?: string;
            };
          };
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/schedules": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get all schedules owned by the current user and the schedules the user is a member of */
    get: {
      parameters: {
        query?: {
          /** @description Filter schedules by role */
          role?: ("owner" | "member" | "manager")[];
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Successful */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ScheduleInfoPreview"][];
          };
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    put?: never;
    /** @description Create a new schedule */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            owner?: string | null;
            name: string;
            description?: string | null;
          };
        };
      };
      responses: {
        /** @description Created successfully */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** Format: uuid */
              scheduleId: string;
            };
          };
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shiftTreeCodeExisting": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Fetches the join-code for shiftree; used on initial click
     * @description Gets the Code for a shiftTree, if the user making request is Owner
     */
    get: {
      parameters: {
        query: {
          /** @description ShiftTreeID to fetch code for */
          ShiftTreeID: components["schemas"]["UUID"];
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description ID Found */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              code?: string;
            };
          };
        };
        /** @description Unauthorised */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shiftTreeCodeGenerate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Generates a new join-code for shiftree; used with generate button
     * @description Generates the Code for a shiftTree, if the user making request is Owner
     */
    get: {
      parameters: {
        query: {
          /** @description ShiftTreeID to generate code for */
          ShiftTreeID: components["schemas"]["UUID"];
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description ID Found */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              code?: string;
            };
          };
        };
        /** @description Unauthorised */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/joinShiftTree": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * Joins a shiftree with given join-code
     * @description Adds a user to the Shiftree
     */
    put: {
      parameters: {
        query?: {
          ShiftTreeID?: components["schemas"]["UUID"];
          UserID?: components["schemas"]["UUID"];
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Request To Join Successful */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description UUID does not have corresponding ShiftTree */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unable to add User to Schedule */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unexpected Error */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UnexpectedError"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/schedules/{scheduleId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get schedule */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          scheduleId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Get detailed info about a schedule */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ScheduleInfo"];
          };
        };
        /** @description Schedule with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Delete schedule */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          scheduleId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Schedule deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description User does not have permission to delete the schedule */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Schedule with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/schedules/{scheduleId}/members": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get schedule members */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          scheduleId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Successful */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UserInfoPreview"][];
          };
        };
        /** @description User does not have permission to view the members */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Schedule with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/schedules/{scheduleId}/shifts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get schedule shifts */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          scheduleId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Successful */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ShiftInfo"][];
          };
        };
        /** @description Schedule with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    put?: never;
    /** Add shift to schedule */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          scheduleId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["ShiftCreateInfo"];
        };
      };
      responses: {
        /** @description Created shift */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ShiftInfo"];
          };
        };
        /** @description User does not have permission to modify the schedule */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Schedule with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/schedules/{scheduleId}/signups": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get schedule signups */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          scheduleId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Successful */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ShiftWithSignups"][];
          };
        };
        /** @description User does not have permission to view the signups */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Schedule with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shifts/{shiftId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Edit shfit */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          shiftId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": {
            name?: string;
            /** Format: date-time */
            startTime?: string;
            /** Format: date-time */
            endTime?: string;
          };
        };
      };
      responses: {
        /** @description Shift updated */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description User does not have permission to modify the shift */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Shift with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    post?: never;
    /** Delete shift */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          shiftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Shift deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description User does not have permission to modify the shift */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Shift with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/signups/{shiftId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Sign up user for shift
     * @description If `userId` is provided and the current user is a manager of the schedule, the specified user
     *     will be signed up for the shift.
     *
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          shiftId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": {
            /**
             * Format: uuid
             * @description User to sign up, can only be another user if the current user is a manager
             */
            userId?: string;
            /** @description Weight of the user's preference for this shift */
            weight?: number;
          };
        };
      };
      responses: {
        /** @description User added to shift */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description User does not exist */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description User does not have permission to modify the shift */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Shift with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    /**
     * Remove sign up for shift
     * @description If `userId` is provided and the current user is a manager of the schedule, the specified user
     *     will have their sign up cancelled.
     *
     */
    delete: {
      parameters: {
        query?: {
          /** @description User to remove, can only be another user if the current user is a manager */
          userId?: string;
        };
        header?: never;
        path: {
          shiftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description User removed from shift */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description User does not exist */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description User does not have permission to modify the shift */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
        /** @description Shift with specified ID does not exist, or user does not have access to it */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Error"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/hello": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Test endpoint */
    get: {
      parameters: {
        query: {
          /** @description Name to greet */
          name: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Successful response */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @example Hello World */
              message?: string;
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    UnexpectedError: {
      /** Format: int32 */
      code: number;
      message: string;
    };
    Error: {
      error: string;
      detail?: string;
    };
    Credentials: {
      email: string;
      password: string;
    };
    RegistrationCredentials: {
      username: string;
      email: string;
      password: string;
    };
    User: {
      name: string;
      accessToken: string;
    };
    UserInfoPreview: {
      /** Format: uuid */
      id: string;
      displayName: string;
      email: string;
      profileImageUrl?: string;
    };
    UUID: string;
    ScheduleInfo: components["schemas"]["ScheduleInfoPreview"];
    ScheduleInfoPreview: {
      /** Format: uuid */
      id: string;
      name: string;
      description: string;
      owner: components["schemas"]["UserInfoPreview"];
      /** Format: date-time */
      startTime: string | null;
      /** Format: date-time */
      endTime: string | null;
      /** @enum {string} */
      role: "owner" | "member" | "manager";
      /** @enum {string} */
      state: "open" | "closed";
    };
    ShiftInfo: {
      /** Format: uuid */
      id: string;
      name: string;
      /** Format: date-time */
      startTime: string;
      /** Format: date-time */
      endTime: string;
    };
    ShiftCreateInfo: {
      name: string;
      /** Format: date-time */
      startTime: string;
      /** Format: date-time */
      endTime: string;
    };
    SignupInfo: {
      user?: components["schemas"]["UserInfoPreview"];
      weight?: number;
    };
    ShiftWithSignups: {
      signups?: components["schemas"]["SignupInfo"][];
    } & components["schemas"]["ShiftInfo"];
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
