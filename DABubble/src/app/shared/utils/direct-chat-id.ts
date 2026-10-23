/**
 * Builds one stable ID for the direct chat between two users.
 * The IDs are sorted, so directChatId('u1', 'u2') === directChatId('u2', 'u1').
 * Both users therefore see the same conversation.
 *
 * @param userA - First user ID
 * @param userB - Second user ID
 * @returns Same ID for both people, e.g. "dm_uidA_uidB"
 */
export function directChatId(userA: string, userB: string): string {
  const [first, second] = [userA, userB].sort();
  return `dm_${first}_${second}`;
}
