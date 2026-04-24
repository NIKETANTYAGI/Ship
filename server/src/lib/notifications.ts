/**
 * SwiftRoute Mock Notifications
 * Replaces Firebase to simplify deployment.
 */

export const sendPushNotification = async (
  token: string, 
  title: string, 
  body: string, 
  data: any = {}
) => {
  console.log('\n--- 🔔 MOCK PUSH NOTIFICATION ---');
  console.log(`To Token: ${token.substring(0, 10)}...`);
  console.log(`Title: ${title}`);
  console.log(`Body: ${body}`);
  console.log(`Data: ${JSON.stringify(data)}`);
  console.log('---------------------------------\n');
  return { success: true, messageId: 'mock-push-id-' + Date.now() };
};
