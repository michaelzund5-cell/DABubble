/**
 * Maximum lengths for user input. Used in the templates (maxlength) and checked again in the services.
 * Later the Firestore rules enforce the same limits on the server.
 */
export const MAX_NAME_LENGTH = 60;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_DESCRIPTION_LENGTH = 500;
